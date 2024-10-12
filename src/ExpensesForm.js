import React, { useState } from 'react';
import { db } from './firebase'; // Asegúrate de importar correctamente Firebase
import { collection, addDoc } from 'firebase/firestore';

const ExpensesForm = ({ onExpenseAdded }) => {
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [cuotas, setCuotas] = useState('');
  const [fecha, setFecha] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (concepto && monto && cuotas && fecha) {
      try {
        // Agregar gasto a Firebase
        await addDoc(collection(db, 'gastos'), {
          concepto,
          monto: parseFloat(monto),
          cuotas: parseInt(cuotas),
          fecha,
        });

        // Llamar a la función para actualizar las tablas
        onExpenseAdded();

        // Limpiar el formulario
        setConcepto('');
        setMonto('');
        setCuotas('');
        setFecha('');
      } catch (error) {
        console.error('Error al registrar gasto:', error);
      }
    }
  };

  return (
    <form className="p-3 border" onSubmit={handleSubmit}>
      <h4>Registrar Gasto</h4>
      <div className="form-group">
        <label>Concepto</label>
        <input
          type="text"
          className="form-control"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Monto</label>
        <input
          type="number"
          className="form-control"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Cuotas</label>
        <input
          type="number"
          className="form-control"
          value={cuotas}
          onChange={(e) => setCuotas(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Fecha de Compra</label>
        <input
          type="date"
          className="form-control"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary mt-3">Registrar</button>
    </form>
  );
};

export default ExpensesForm;
