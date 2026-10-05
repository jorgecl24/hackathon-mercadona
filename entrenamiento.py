import pandas as pd
import joblib
from sklearn.linear_model import SGDRegressor
from sklearn.preprocessing import StandardScaler
import warnings

warnings.filterwarnings('ignore')

# 1. Cargar y limpiar el dataset histórico
archivo_historico = "ventas_mercadona_completo.csv"
try:
    df = pd.read_csv(archivo_historico)
    df = df.dropna() # Limpiar filas mal formateadas con NaNs
except FileNotFoundError:
    print(f"Error: No se encuentra el archivo {archivo_historico}.")
    exit()

# 2. Definir las variables de contexto (Features)
features = [
    'Intensidad_Lluvia', 'Temp_Max', 'Temp_Min', 'Importancia_Concierto', 
    'Importancia_Partido_Local', 'Importancia_Partido_TV', 'Importancia_Previa_Festivo', 
    'Importancia_Festivo', 'Intensidad_Operacion_Salida', 'Nivel_Turismo'
]

productos = df['Producto'].unique()
modelos = {}
scalers = {}

print("Entrenando modelos base y analizando pesos...\n" + "="*50)

# 3. Entrenar un modelo por cada producto
for prod in productos:
    df_prod = df[df['Producto'] == prod].copy()
    
    # Si hay muy pocos datos para un producto, lo saltamos
    if len(df_prod) < 5:
        continue
        
    X = df_prod[features]
    y = df_prod['Ventas_Unidades']
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    modelo = SGDRegressor(learning_rate='adaptive', eta0=0.01, random_state=42)
    modelo.fit(X_scaled, y)
    
    modelos[prod] = modelo
    scalers[prod] = scaler
    
    # 4. Mostrar el análisis de relevancia de los eventos
    print(f"\nPRODUCTO: {prod.upper()}")
    print(f"Ventas Base Promedio: {int(max(0, modelo.intercept_[0]))} uds/día")
    
    pesos = pd.DataFrame({'Variable': features, 'Impacto': modelo.coef_})
    pesos_ordenados = pesos.sort_values(by='Impacto', ascending=False)
    
    print("  ▲ Variables que más SUMAN ventas:")
    for _, row in pesos_ordenados.head(2).iterrows():
        print(f"    + {row['Variable']}: {row['Impacto']:.2f}")
        
    print("  ▼ Variables que más RESTAN ventas:")
    for _, row in pesos_ordenados.tail(2).sort_values(by='Impacto').iterrows():
        print(f"    - {row['Variable']}: {row['Impacto']:.2f}")

# 5. Guardar los "cerebros" para usarlos en el día a día
joblib.dump({'modelos': modelos, 'scalers': scalers}, 'modelos_mercadona.pkl')
print("\n" + "="*50 + "\nModelos guardados exitosamente en 'modelos_mercadona.pkl'.")