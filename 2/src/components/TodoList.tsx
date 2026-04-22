import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Todo } from '../types';

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('pomodoro-todos');
    if (saved) {
      const parsed = JSON.parse(saved) as Todo[];
      const today = new Date().toDateString();
      return parsed.filter(
        (todo) => new Date(todo.createdAt).toDateString() === today
      );
    }
    return [];
  });

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    localStorage.setItem('pomodoro-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos((prev) => [...prev, newTodo]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const deleteCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">今日任务</h2>
        {totalCount > 0 && (
          <span className="text-sm text-gray-500">
            {completedCount}/{totalCount} 已完成
          </span>
        )}
      </div>

      <form onSubmit={addTodo} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="添加新任务..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-focus/50 focus:border-focus transition-all"
          />
          <motion.button
            type="submit"
            className="px-4 py-2 bg-focus text-white rounded-lg font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            添加
          </motion.button>
        </div>
      </form>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {todos.length === 0 ? (
            <motion.p
              className="text-center text-gray-400 py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              暂无任务，开始添加吧！
            </motion.p>
          ) : (
            todos.map((todo) => (
              <motion.div
                key={todo.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  todo.completed ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-focus'
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  {todo.completed && (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </motion.button>

                <span
                  className={`flex-1 transition-all ${
                    todo.completed
                      ? 'text-gray-400 line-through'
                      : 'text-gray-700'
                  }`}
                >
                  {todo.text}
                </span>

                <motion.button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </motion.button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {completedCount > 0 && (
        <motion.button
          onClick={deleteCompleted}
          className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          清除已完成任务
        </motion.button>
      )}
    </motion.div>
  );
};

export default TodoList;
