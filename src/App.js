import React, { useState } from 'react';
import ExpensesForm from './ExpensesForm';
import ExpensesTable from './ExpensesTable';
import 'bootstrap/dist/css/bootstrap.min.css'; // Asegúrate de importar Bootstrap

const App = () => {
  const [refresh, setRefresh] = useState(false);

  const handleExpenseAdded = () => {
    // Cambiar estado para refrescar las tablas cuando se registre un gasto
    setRefresh(!refresh);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-4">
          <ExpensesForm onExpenseAdded={handleExpenseAdded} />
        </div>
        <div className="col-8">
          <ExpensesTable key={refresh} />
        </div>
      </div>
    </div>
  );
};

export default App;
