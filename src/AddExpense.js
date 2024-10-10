import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig'; // Asegúrate de importar la configuración de Firebase
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

const AddExpense = ({ onExpenseAdded }) => {
    const [concepto, setConcepto] = useState('');
    const [valor, setValor] = useState('');
    const [cuotas, setCuotas] = useState('');

    const saveGastoToDB = async (e) => {
        e.preventDefault();

        // Validaciones simples
        if (!concepto || !valor || !cuotas) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        const totalValor = parseFloat(valor);
        const totalCuotas = parseInt(cuotas);

        // Validación de números positivos
        if (totalValor <= 0 || totalCuotas <= 0) {
            alert('Por favor, ingresa valores positivos.');
            return;
        }

        // Calcular el monto por cuota
        const montoPorCuota = totalValor / totalCuotas;

        try {
            // Guarda el gasto en Firebase
            await addDoc(collection(db, 'gastos'), {
                concepto,
                valor: totalValor,
                cuotas: totalCuotas,
                montoPorCuota: montoPorCuota, // Almacena el monto por cuota
                fecha: new Date().toISOString(), // Guarda la fecha actual como ISO
            });

            alert('Gasto guardado correctamente');
            setConcepto('');
            setValor('');
            setCuotas('');

            // Llama a la función pasada como prop para actualizar la tabla
            if (onExpenseAdded) onExpenseAdded();

        } catch (error) {
            console.error('Error al guardar gasto:', error);
            alert('Hubo un error al guardar el gasto. Inténtalo de nuevo.');
        }
    };

    // Si necesitas que los gastos se actualicen en tiempo real, puedes usar esto
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'gastos'), (snapshot) => {
            const gastosData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            console.log('Gastos actualizados:', gastosData);
            // Se podría usar setGastos si se desea almacenar localmente
        });

        return () => unsubscribe();
    }, []);

    return (
        <form onSubmit={saveGastoToDB}>
            <input
                type="text"
                placeholder="Concepto"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
            />
            <input
                type="number"
                placeholder="Valor"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                min="0"
                step="0.01"
            />
            <input
                type="number"
                placeholder="Número de Cuotas"
                value={cuotas}
                onChange={(e) => setCuotas(e.target.value)}
                min="1"
            />
            <button type="submit">Guardar Gasto</button>
        </form>
    );
};

export default AddExpense;
