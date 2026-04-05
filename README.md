# División de Cuentas

App móvil para dividir gastos entre grupos de personas. Desarrollada con React Native y Expo.

## Funcionalidades

- Crear y eliminar grupos (viajes, salidas, eventos, etc.)
- Agregar personas a cada grupo
- Registrar gastos indicando quién pagó y quiénes participaron
- Editar y eliminar gastos
- Resumen de liquidación: calcula automáticamente quién le debe cuánto a quién con el mínimo de transferencias posibles
- Persistencia local de datos con AsyncStorage

## Tecnologías

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/) ~54
- [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage)

## Estructura del proyecto

```
Division_de_Cuentas/
├── App.js                        # Raíz de la app y manejo de navegación
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js         # Lista de grupos
│   │   ├── GroupScreen.js        # Detalle del grupo (personas y gastos)
│   │   ├── AddExpenseScreen.js   # Formulario para agregar/editar gastos
│   │   └── SummaryScreen.js      # Resumen de quién le debe a quién
│   └── utils/
│       └── calculator.js         # Lógica de cálculo de balances y liquidación
```

## Instalación y uso

### Requisitos

- [Node.js](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Android Studio con un emulador AVD configurado (o dispositivo físico con USB debugging)

### Pasos

```bash
# Instalar dependencias
npm install

# Iniciar la app en el emulador Android
npx expo start --android
```

También podés escanear el QR con la app **Expo Go** desde tu celular.
