const socket = io();

  document.getElementById('create-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const roomName = document.getElementById('create-room-name').value;
      const password = document.getElementById('create-password').value;
      fetch('/create-room', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roomName, password })
      })
      .then(response => response.text())
      .then(data => {
          alert(data);
      });
  });

  document.getElementById('join-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const roomName = document.getElementById('join-room-name').value;
      const password = document.getElementById('join-password').value;
      fetch('/join-room', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roomName, password })
      })
      .then(response => response.text())
      .then(data => {
          alert(data);
          if (data === 'Authentication successful') {
              socket.emit('join-room', roomName);
          }
      });
  });

  document.getElementById('chat-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const message = document.getElementById('message-input').value;
      const roomName = document.getElementById('join-room-name').value;
      socket.emit('chat-message', { roomName, message });
      document.getElementById('message-input').value = '';
  });

  socket.on('chat-message', (message) => {
      const li = document.createElement('li');
      li.textContent = message;
      document.getElementById('messages').appendChild(li);
  });
