import React, { useState, useEffect } from "react";
import { db } from "./firebase"; // Asegúrate de importar correctamente Firebase
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css"; // Asegúrate de importar Bootstrap

const AllExpensesTable = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // Para saber qué gasto se está editando
  const [updatedExpense, setUpdatedExpense] = useState({ concepto: '', monto: '', cuotas: '' }); // Para almacenar los datos de edición
  const today = new Date(); // Obtener la fecha actual

  const fetchExpenses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "gastos"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setExpenses(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los gastos:", error);
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setUpdatedExpense({ concepto: expense.concepto, monto: expense.monto, cuotas: expense.cuotas }); // Cargar datos en el estado
  };

  const handleUpdate = async (id) => {
    try {
      const expenseDoc = doc(db, "gastos", id);
      await updateDoc(expenseDoc, updatedExpense);
      setEditingId(null); // Salir del modo de edición
      fetchExpenses(); // Actualiza la lista después de editar
    } catch (error) {
      console.error("Error al actualizar el gasto:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filtrar los gastos que aún no han sido pagados
  const filteredExpenses = expenses.filter((expense) => {
    const { cuotas, fecha } = expense;
    const paymentDate = new Date(fecha);
    paymentDate.setDate(paymentDate.getDate() + (cuotas * 30)); // Suponiendo 30 días por cuota

    return today < paymentDate; // Mostrar solo si no ha pasado la fecha de pago
  });

  return (
    <div className="table-responsive">
      {loading ? (
        <p>Cargando gastos...</p>
      ) : (
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Cuotas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr key={expense.id}>
                {editingId === expense.id ? ( // Si estamos editando, mostrar campos de entrada
                  <>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={updatedExpense.concepto}
                        onChange={(e) => setUpdatedExpense({ ...updatedExpense, concepto: e.target.value })}
                      />
                    </td>
                    <td>{expense.fecha}</td> {/* Muestra la fecha original, no editable */}
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={updatedExpense.monto}
                        onChange={(e) => setUpdatedExpense({ ...updatedExpense, monto: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={updatedExpense.cuotas}
                        onChange={(e) => setUpdatedExpense({ ...updatedExpense, cuotas: e.target.value })}
                      />
                    </td>
                    <td>
                      <button className="btn btn-success" onClick={() => handleUpdate(expense.id)}>Guardar</button>
                      <button className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancelar</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{expense.concepto}</td>
                    <td>{expense.fecha}</td>
                    <td>{expense.monto}</td>
                    <td>{expense.cuotas}</td>
                    <td>
                      <button className="btn btn-warning" onClick={() => handleEdit(expense)}>Editar</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AllExpensesTable;
