import pandas as pd
import joblib
import os
import numpy as np
import json
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

features = [
    'Intensidad_Lluvia', 'Temp_Max', 'Temp_Min', 'Importancia_Concierto', 
    'Importancia_Partido_Local', 'Importancia_Partido_TV', 'Importancia_Previa_Festivo', 
    'Importancia_Festivo', 'Intensidad_Operacion_Salida', 'Nivel_Turismo'
]

try:
    datos_guardados = joblib.load('modelos_mercadona.pkl')
    modelos = datos_guardados['modelos']
    scalers = datos_guardados['scalers']
    historial_errores = datos_guardados.get('historial_errores', {})
except FileNotFoundError:
    print("Error: No se encuentra 'modelos_mercadona.pkl'.")
    exit()

archivo_futuro = "predic_mercadona.csv"
#por si no existe el archivo
if not os.path.exists(archivo_futuro):
    df_falso = pd.DataFrame({f: [0]*8 for f in features})
    df_falso['Temp_Max'] = [35, 36, 30, 25, 22, 28, 30, 31]
    df_falso['Importancia_Partido_TV'] = [90, 0, 0, 0, 80, 0, 0, 0]
    df_falso['Nivel_Turismo'] = [99, 99, 90, 80, 80, 85, 90, 95]
    df_falso.to_csv(archivo_futuro, index=False)

df_futuro = pd.read_csv(archivo_futuro)
X_futuro = df_futuro[features]
X_hoy_df = pd.DataFrame([X_futuro.iloc[0].to_dict()], columns=features)

predicciones_hoy = {}
for prod, modelo in modelos.items():
    scaler = scalers[prod]
    X_futuro_scaled = scaler.transform(X_futuro)
    preds = [int(max(0, p)) for p in modelo.predict(X_futuro_scaled)]
    predicciones_hoy[prod] = preds[0]

json_output = {
    "fecha_calculo": datetime.now().strftime("%Y-%m-%d"),
    "tienda": "Mercadona - Principal",
    "predicciones_productos": []
}

for prod, modelo in modelos.items():
    scaler = scalers[prod]
    pred_hoy = predicciones_hoy[prod]
    
    # Venta simulada
    venta_real = int(pred_hoy * np.random.uniform(0.7, 1.4)) 
    
    # Calcular precisión histórica reciente (MAPE de los últimos 7 días)
    error_porcentual = abs(venta_real - pred_hoy) / max(1, venta_real)
    if prod not in historial_errores:
        historial_errores[prod] = []
        
    historial_errores[prod].append(error_porcentual)
    if len(historial_errores[prod]) > 7:
        historial_errores[prod].pop(0)
        
    mape_medio = np.mean(historial_errores[prod])
    confianza = max(0, int((1 - mape_medio) * 100))
    
    pesos_antiguos = modelo.coef_.copy()

    # Ajuste del modelo con la venta real
    scaler.partial_fit(X_hoy_df)
    X_hoy_scaled = scaler.transform(X_hoy_df)
    modelo.partial_fit(X_hoy_scaled, [venta_real])
    
    pesos_nuevos = modelo.coef_.copy()
    dif_pesos = pesos_nuevos - pesos_antiguos
    idx_max = np.argmax(np.abs(dif_pesos))

    # Identificar la variable que más influyó en el ajuste
    var_culpa = features[idx_max]
    tendencia = "+" if dif_pesos[idx_max] > 0 else "-"
    ajuste_str = f"{tendencia} {var_culpa}"
    
    X_semana_scaled = scaler.transform(X_futuro.iloc[1:])
    preds_nuevas = [int(max(0, p)) for p in modelo.predict(X_semana_scaled)]
    
    predicciones_totales = [pred_hoy] + preds_nuevas
    
    json_output["predicciones_productos"].append({
        "nombre_producto": prod,
        "predicciones_diarias": predicciones_totales,
        "motivo_principal_ajuste": ajuste_str,
        "confianza_historica_reciente": f"{confianza}%"
    })

joblib.dump({
    'modelos': modelos, 
    'scalers': scalers,
    'historial_errores': historial_errores
}, 'modelos_mercadona.pkl')

with open('predicciones_output.json', 'w', encoding='utf-8') as f:
    json.dump(json_output, f, indent=4, ensure_ascii=False)

print("Proceso completado. Predicciones exportadas a 'predicciones_output.json'.")