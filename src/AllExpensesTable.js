import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";

const AllExpensesTable = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [updatedExpense, setUpdatedExpense] = useState({ concepto: "", monto: "", cuotas: "" });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const today = new Date();

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
    setUpdatedExpense({ concepto: expense.concepto, monto: expense.monto, cuotas: expense.cuotas });
  };

  const handleUpdate = async (id) => {
    try {
      const expenseDoc = doc(db, "gastos", id);
      await updateDoc(expenseDoc, updatedExpense);
      setEditingId(null);
      fetchExpenses();
    } catch (error) {
      console.error("Error al actualizar el gasto:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter((expense) => {
    const { cuotas, fecha } = expense;
    const paymentDate = new Date(fecha);
    paymentDate.setDate(paymentDate.getDate() + cuotas * 30);
    return today < paymentDate;
  });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === "fecha") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }

    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
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
              <th onClick={() => handleSort("fecha")} style={{ cursor: "pointer" }}>
                Fecha {sortConfig.key === "fecha" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
              <th onClick={() => handleSort("monto")} style={{ cursor: "pointer" }}>
                Monto {sortConfig.key === "monto" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
              <th onClick={() => handleSort("cuotas")} style={{ cursor: "pointer" }}>
                Cuotas {sortConfig.key === "cuotas" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedExpenses.map((expense) => (
              <tr key={expense.id}>
                {editingId === expense.id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={updatedExpense.concepto}
                        onChange={(e) => setUpdatedExpense({ ...updatedExpense, concepto: e.target.value })}
                      />
                    </td>
                    <td>{expense.fecha}</td>
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
                      <button className="btn btn-success" onClick={() => handleUpdate(expense.id)}>
                        Guardar
                      </button>
                      <button className="btn btn-secondary" onClick={() => setEditingId(null)}>
                        Cancelar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{expense.concepto}</td>
                    <td>{expense.fecha}</td>
                    <td>{expense.monto}</td>
                    <td>{expense.cuotas}</td>
                    <td>
                      <button className="btn btn-warning" onClick={() => handleEdit(expense)}>
                        Editar
                      </button>
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
