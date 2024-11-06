import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [, setLastModifiedTime] = useState('');
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const apiUrl = "http://localhost:5000/api";
  const debounceRef = useRef(null);

  // Загружаем данные с сервера
  useEffect(() => {
    fetch(`${apiUrl}/value`)
      .then((response) => response.json())
      .then((data) => {
        setValue(data.value);
        setLastModifiedTime(data.last_modified_time);
        setIsLoading(false);

        // Проверяем, прошло ли больше 10 секунд с последнего обновления
        const currentTime = new Date();
        const savedTime = new Date(data.last_modified_time);

        // Если время последнего изменения больше 10 секунд, спрашиваем пользователя
        if (currentTime - savedTime > 10000) {
          setShouldUpdate(true);
        }
      })
      .catch((error) => {
        console.error('Ошибка при загрузке данных:', error);
      });
  }, []);

  // Функция для отправки данных на сервер
  const sendValueToServer = (newValue) => {
    fetch(`${apiUrl}/value/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: newValue }), // Отправляем новое значение
    })
      .then((response) => response.json())
      .then((data) => {
        setValue(data.value);
        setLastModifiedTime(data.last_modified_time);
        setShouldUpdate(false);
      })
      .catch((error) => console.error('Ошибка при сохранении данных:', error));
  };

  const handleValueChange = (e) => {
    const newValue = e.target.value;

    setValue(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (newValue.trim() !== "") {
        sendValueToServer(newValue);
      }
    }, 1000);
  };

  // Функция для обновления значения на сервере
  const handleUpdateValue = () => {
    fetch(`${apiUrl}/value/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: "" }),
    })
      .then((response) => response.json())
      .then((data) => {
        setValue(data.value);
        setLastModifiedTime(data.last_modified_time);
        setShouldUpdate(false);
      })
      .catch((error) => console.error('Ошибка при сохранении данных:', error));
  };

  // Отправляем запрос на сервер для обновления только времени
  const handleKeepOldValue = () => {
    fetch(`${apiUrl}/value/keep`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "last_modified_time updated successfully") {
          setLastModifiedTime(data.last_modified_time);
        }
        setShouldUpdate(false);
      })
      .catch((error) => console.error('Ошибка при сохранении данных:', error));
  };

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div>
      <h1>Случайное значение:</h1>
      <input
        type="text"
        value={value}
        onChange={handleValueChange}
      />
      {shouldUpdate && (
        <div>
          <p>Значение устарело, хотите обновить его?</p>
          <button onClick={handleUpdateValue}>Да, обновить</button>
          <button onClick={handleKeepOldValue}>Оставить старое</button>
        </div>
      )}
    </div>
  );
}

export default App;
