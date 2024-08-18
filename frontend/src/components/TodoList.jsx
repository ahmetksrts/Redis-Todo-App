/* TodoList.jsx */
/* -------------------- */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'semantic-ui-css/semantic.min.css';
import { Loader, Image, Segment } from 'semantic-ui-react';
import "./TodoList.css";

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchTodos();
    }, []);

    // end loading in 1 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, [1000]);

        return () => clearTimeout(timer); // Clear timer on unmount
    }, []); // Run useEffect once


    const fetchTodos = async () => {
        try {
            const response = await axios.get('/api/todos');
            const formattedTodos = response.data.map(todo => ({
                id: todo.id,
                task: todo.task,
                completed: todo.completed,
                timestamp: todo.timestamp 
            }));
            setTodos(formattedTodos);
        } 
        catch (error) {
            console.error('Error fetching todos:', error);
        }
    };

    const addTodo = async () => {
        try {
            if (!newTask.trim()) {
                alert("Please provide a valid task");
                return;
            }
            const response = await axios.post('/api/todo', { task: newTask });
            setTodos([...todos, response.data]);
            setNewTask('');
            fetchTodos();
        } 
        catch (error) {
            console.error('Error adding todo:', error);
        }
    };

    const deleteAllTodos = async () => {
        try {
            await axios.delete('/api/deleteAll');
            setTodos([]);
            fetchTodos();
        } 
        catch (error) {
            console.error('Error deleting all todos:', error);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axios.delete(`/api/todo/${id}`);
            setTodos(todos.filter(todo => todo.id !== id));
            fetchTodos();
        } 
        catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    const changeTaskStatus = async (id) => {
        try {
            const todo = todos.find(todo => todo.id === id);
            if (todo) {
                const newStatus = !todo.completed;
                await axios.put(`/api/todo/${id}`, { completed: newStatus });
                setTodos(todos.map(todo =>
                    todo.id === id ? { ...todo, completed: newStatus } : todo
                ));
            }
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    return (
        <div className='container my-5'>
            <div className='mx-auto rounded border p-4' id='TodoList-container'>
            <h1 className='text-white text-center mb-5'>MY TODO LIST</h1>
            <div className='form'>
                <form className='d-flex' onSubmit={(e) => { e.preventDefault(); addTodo(); }}>
                    <input 
                        className='form-control me-2'
                        placeholder='New Task' 
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                    />
                    <button className='btn btn-outline-light' id='buttonAdd' type='submit'>Add</button>
                    <button className='btn btn-outline-light' id='buttonDelete' type='button' onClick={deleteAllTodos}>Delete All</button>
                </form>
            </div>
            
            {loading ? (
                <div>
                    <Segment>
                        <Loader active />

                        <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
                    </Segment>
                </div>
            ) : (
                <div>
                    {todos.map((todo) => (
                        <div key={todo.id} className='rounded mt-4 p-2 d-flex' id='map-div'
                            style={{backgroundColor: todo.completed ? "#87FC68" : "lightgray", textDecoration: todo.completed ? "line-through" : "none"}}>
                            <div className='me-auto'>
                                <li>
                                    {todo.task} - Added at: {todo.timestamp}
                                </li>
                            </div>
                            <div>
                                <i className={`h5 me-2 bi bi-${todo.completed ? 'check-square' : 'square'}`}
                                    style={{cursor: "pointer"}} 
                                    onClick={() => changeTaskStatus(todo.id)}></i>
                                <i className="bi bi-trash text-danger h5"
                                    style={{cursor: "pointer"}} 
                                    onClick={() => deleteTodo(todo.id)}></i>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            </div>
        </div>
    );
}

export default TodoList;