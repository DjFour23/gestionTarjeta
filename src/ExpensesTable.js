import React, { useState, useEffect, useCallback } from "react";
import { db } from "./firebase"; // Asegúrate de importar correctamente Firebase
import { collection, getDocs } from "firebase/firestore";
import { addMonths, format, subMonths } from "date-fns";
import "./ExpensesTable.css"; // Importa el archivo CSS

const ExpensesTable = () => {
  const [expensesByMonth, setExpensesByMonth] = useState({});
  const [loading, setLoading] = useState(true);
  const corteDia = 10; // Fecha de corte fija

  const fetchExpenses = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "gastos"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      processExpenses(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los gastos:", error);
      setLoading(false);
    }
  }, []); // No tiene dependencias que cambien

  // Procesar gastos por mes
  const processExpenses = (expenses) => {
    const expensesByMonth = {};
    expenses.forEach((expense) => {
      const { concepto, fecha, monto, cuotas } = expense;
      const montoCuota = monto / cuotas;
      const compraDate = new Date(fecha);

      // Ajustar la fecha para asegurar que no haya discrepancias por zonas horarias
      const adjustedDate = new Date(
        compraDate.getTime() + compraDate.getTimezoneOffset() * 60000
      );

      let startPaymentDate = new Date(adjustedDate);

      if (adjustedDate.getDate() > corteDia) {
        startPaymentDate = addMonths(startPaymentDate, 1);
      }
      startPaymentDate.setDate(5);

      for (let i = 0; i < cuotas; i++) {
        const paymentMonth = addMonths(startPaymentDate, i);
        const formattedMonth = format(paymentMonth, "MMMM yyyy");
        const startPeriodDate = `11/${format(
          subMonths(paymentMonth, 1),
          "MM/yyyy"
        )}`;
        const endPeriodDate = `10/${format(paymentMonth, "MM/yyyy")}`;
        const paymentDate = format(addMonths(paymentMonth, 1), "dd/MM/yyyy");

        if (!expensesByMonth[formattedMonth]) {
          expensesByMonth[formattedMonth] = {
            totalMes: 0,
            detalles: [],
            paymentDate,
            startPeriodDate,
            endPeriodDate,
          };
        }

        expensesByMonth[formattedMonth].detalles.push({
          concepto,
          fecha: format(adjustedDate, "dd/MM/yyyy"), // Mostrar la fecha ajustada correctamente
          montoMensual: new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
          }).format(montoCuota),
          monto: new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
          }).format(monto),
        });

        expensesByMonth[formattedMonth].totalMes += montoCuota;
      }
    });

    setExpensesByMonth(expensesByMonth);
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const today = new Date();

  // Ordenar los meses cronológicamente
  const sortedMonths = Object.keys(expensesByMonth).sort((a, b) => {
    const dateA = new Date(expensesByMonth[a].paymentDate.split("/").reverse().join("-"));
    const dateB = new Date(expensesByMonth[b].paymentDate.split("/").reverse().join("-"));
    return dateA - dateB; // Ordenar por fecha
  });

  return (
    <div>
      {loading ? (
        <p>Cargando gastos...</p>
      ) : (
        sortedMonths
          .filter((month) => {
            const paymentDate = new Date(
              expensesByMonth[month].paymentDate.split("/").reverse().join("-")
            );

            // Logs de depuración para verificar fechas
            console.log("Mes:", month);
            console.log("Fecha de pago:", expensesByMonth[month].paymentDate);
            console.log("Fecha de pago (objeto Date):", paymentDate);
            console.log("Fecha actual (today):", today);

            // Mantener el reporte de un mes visible hasta su fecha de pago (día 5 del siguiente mes)
            return (
              paymentDate >= today
            );
          })
          .map((month, index) => (
            <div key={index}>
              <h4>{month}</h4>
              <p>
                <strong>Fecha límite de pago:</strong>{" "}
                {expensesByMonth[month].paymentDate}
              </p>
              <p>
                <strong>Periodo de facturación:</strong>{" "}
                {expensesByMonth[month].startPeriodDate} -{" "}
                {expensesByMonth[month].endPeriodDate}
              </p>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Fecha Adquirida</th>
                    <th>Monto Mensual</th>
                    <th>Monto Total</th>
                  </tr>
                </thead>
                <tbody>
                  {expensesByMonth[month].detalles.map((expense, idx) => (
                    <tr key={idx}>
                      <td>{expense.concepto}</td>
                      <td>{expense.fecha}</td> {/* Fecha ajustada */}
                      <td>{expense.montoMensual}</td>
                      <td>{expense.monto}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="2">
                      <strong>Total del mes:</strong>
                    </td>
                    <td>
                      <strong>
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                        }).format(expensesByMonth[month].totalMes)}
                      </strong>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))
      )}
    </div>
  );
};

export default ExpensesTable;
