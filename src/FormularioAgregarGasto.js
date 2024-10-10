import React, { useState } from 'react';

const FormularioAgregarGasto = ({ onAgregar }) => {
  const [fecha, setFecha] = useState('');
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [cuotas, setCuotas] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones adicionales
    if (monto <= 0 || cuotas <= 0) {
      alert('Por favor, ingresa un monto y cuotas válidos.');
      return;
    }

    const nuevoGasto = {
      fecha,
      concepto,
      monto: parseFloat(monto),
      cuotas: parseInt(cuotas),
    };

    // Llamar a la función que maneja la adición del gasto
    onAgregar(nuevoGasto);

    // Resetear los valores del formulario
    setFecha('');
    setConcepto('');
    setMonto('');
    setCuotas(1);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        required
      />
      <input
        type="text"
        value={concepto}
        onChange={(e) => setConcepto(e.target.value)}
        placeholder="Concepto"
        required
      />
      <input
        type="number"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        placeholder="Monto"
        min="0.01" // Asegura que solo se ingresen valores positivos
        step="0.01"
        required
      />
      <input
        type="number"
        value={cuotas}
        onChange={(e) => setCuotas(e.target.value)}
        placeholder="Cuotas"
        min="1"
        required
      />
      <button type="submit">Agregar Gasto</button>
    </form>
  );
};

export default FormularioAgregarGasto;
