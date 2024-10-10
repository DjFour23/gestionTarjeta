import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Asegúrate de importar correctamente Firebase
import { collection, getDocs } from 'firebase/firestore';
import { addMonths, format, subMonths } from 'date-fns';
import './ExpensesTable.css'; // Importa el archivo CSS

const ExpensesTable = () => {
  const [expensesByMonth, setExpensesByMonth] = useState({});
  const [loading, setLoading] = useState(true);
  const corteDia = 10; // Fecha de corte fija

  // Formatear números como moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Función para obtener los gastos desde Firebase
  const fetchExpenses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'gastos'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      processExpenses(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los gastos:", error);
      setLoading(false);
    }
  };

  // Función para procesar los gastos por mes
  const processExpenses = (expenses) => {
    const expensesByMonth = {};

    expenses.forEach(expense => {
      const { concepto, fecha, monto, cuotas } = expense;
      const montoCuota = monto / cuotas; // Calcular monto mensual
      const compraDate = new Date(fecha);
      let startPaymentDate = new Date(compraDate);

      console.log(expense);
      console.log(`Gasto: ${concepto}, Fecha: ${fecha}, Monto Total: ${monto}, Cuotas: ${cuotas}, Monto Mensual: ${montoCuota}`);

      // Si la compra se hizo después del 10, el pago es para el mes siguiente al corte
      if (compraDate.getDate() > corteDia) {
        startPaymentDate = addMonths(startPaymentDate, 1); // Suma un mes si pasa del corte
      }
      startPaymentDate.setDate(5); // Los pagos son el 5 de cada mes

      // Distribuir las cuotas en los meses correspondientes
      for (let i = 0; i < cuotas; i++) {
        const paymentMonth = addMonths(startPaymentDate, i); // Calcular cada mes de pago
        const formattedMonth = format(paymentMonth, 'MMMM yyyy'); // Mes en formato "Mes Año"

        // **Corregir inicio del periodo de facturación**: Del 11 del mes anterior al 10 del mes actual
        const startPeriodDate = `11/${format(subMonths(paymentMonth, 1), 'MM/yyyy')}`; // 11 del mes anterior
        const endPeriodDate = `10/${format(paymentMonth, 'MM/yyyy')}`; // 10 del mes actual

        // Fecha límite de pago (5 del segundo mes siguiente)
        const paymentDate = format(addMonths(paymentMonth, 1), 'dd/MM/yyyy'); // 5 del segundo mes siguiente

        if (!expensesByMonth[formattedMonth]) {
          expensesByMonth[formattedMonth] = {
            totalMes: 0,
            detalles: [],
            paymentDate,
            startPeriodDate,
            endPeriodDate,
          };
        }

        // Agregar el gasto a la lista del mes correspondiente
        expensesByMonth[formattedMonth].detalles.push({
          concepto,
          fecha: format(compraDate, 'dd/MM/yyyy'),
          montoMensual: formatCurrency(montoCuota), // Formatear monto mensual como moneda
          monto: formatCurrency(monto) // Formatear monto total como moneda
        });

        // Sumar el monto de la cuota al total mensual
        expensesByMonth[formattedMonth].totalMes += montoCuota;
      }
    });

    setExpensesByMonth(expensesByMonth);
  };

  useEffect(() => {
    fetchExpenses(); // Cargar los gastos al montar el componente
  }, []);

  if (loading) {
    return <p>Cargando gastos...</p>;
  }

  return (
    <div>
      {Object.keys(expensesByMonth).map((month, index) => (
        <div key={index}>
          <h2>{month}</h2>
          <p><strong>Fecha límite de pago:</strong> {expensesByMonth[month].paymentDate}</p>
          <p><strong>Periodo de facturación:</strong> {expensesByMonth[month].startPeriodDate} - {expensesByMonth[month].endPeriodDate}</p>
          <table className="expenses-table">
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
                  <td>{expense.fecha}</td>
                  <td>{expense.montoMensual}</td>
                  <td>{expense.monto}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="2"><strong>Total del mes:</strong></td>
                <td><strong>{formatCurrency(expensesByMonth[month].totalMes)}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ExpensesTable;
