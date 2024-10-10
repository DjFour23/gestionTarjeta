import React, { useEffect, useState } from 'react';
import { db } from './firebase'; // Importa la configuración de Firebase
import { collection, addDoc, getDocs } from 'firebase/firestore'; // Importa las funciones necesarias de Firestore
import ExpensesTable from './ExpensesTable';
import FormularioAgregarGasto from './FormularioAgregarGasto';

const App = () => {
  const [gastos, setGastos] = useState([]); // Estado para almacenar los gastos

  // Función para obtener los gastos de Firestore
  const fetchGastos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "gastos")); // Asegúrate de que la colección sea correcta
      const gastosArray = [];
      querySnapshot.forEach((doc) => {
        gastosArray.push({ id: doc.id, ...doc.data() }); // Agrega el ID del documento junto con los datos
      });
      setGastos(gastosArray); // Actualiza el estado con los gastos obtenidos
    } catch (error) {
      console.error("Error al obtener los gastos:", error);
    }
  };

  // Función para agregar un nuevo gasto
  const agregarGasto = async (nuevoGasto) => {
    try {
      await addDoc(collection(db, "gastos"), nuevoGasto); // Guarda el nuevo gasto en la colección de Firestore
      alert("¡Gasto agregado con éxito!");
      fetchGastos(); // Actualiza los gastos después de agregar uno nuevo
    } catch (error) {
      console.error("Error al agregar el gasto:", error);
      alert("Error al agregar el gasto");
    }
  };

  // useEffect para cargar los gastos al montar el componente
  useEffect(() => {
    fetchGastos(); // Carga los gastos desde Firestore cuando se monta el componente
  }, []);

  // Calcular total y cuotas
  const calcularCuotas = () => {
    const total = gastos.reduce((acc, gasto) => acc + gasto.monto, 0);
    const cuotas = gastos.reduce((acc, gasto) => acc + gasto.cuotas, 0);
    return { total, cuotas };
  };

  const { total, cuotas } = calcularCuotas();

  return (
    <div>
      <h1>Gestión de Gastos</h1>
      <ExpensesTable gastos={gastos} total={total} cuotas={cuotas} />
      <FormularioAgregarGasto onAgregar={agregarGasto} />
    </div>
  );
};

export default App;
