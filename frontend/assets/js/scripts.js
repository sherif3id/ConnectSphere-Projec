document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');
  const userList = document.getElementById('userList');
  const clearUsersBtn = document.getElementById('clearUsersBtn');

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('error');
      const successEl = document.getElementById('success');
      errorEl.style.display = 'none';
      successEl.style.display = 'none';

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      try {
        const response = await fetch('http://localhost:3000/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.ok) {
          successEl.textContent = result.message;
          successEl.style.display = 'block';
          e.target.reset();
        } else {
          errorEl.textContent = result.error;
          errorEl.style.display = 'block';
        }
      } catch (err) {
        errorEl.textContent = 'Unable to connect to the server';
        errorEl.style.display = 'block';
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('error');
      const successEl = document.getElementById('success');
      errorEl.style.display = 'none';
      successEl.style.display = 'none';

      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData);

      try {
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();

        if (response.ok) {
          successEl.textContent = `Welcome back, ${result.user.name}!`;
          successEl.style.display = 'block';
          e.target.reset();
        } else {
          errorEl.textContent = result.error;
          errorEl.style.display = 'block';
        }
      } catch (err) {
        errorEl.textContent = 'Unable to connect to the server';
        errorEl.style.display = 'block';
      }
    });
  }

  if (userList) {
    const loadUsers = () => {
      userList.innerHTML = '';
      fetch('http://localhost:3000/api/users')
        .then(response => response.json())
        .then(data => {
          data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${user.id}</td>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td><button class="delete-btn" data-id="${user.id}">Delete</button></td>
            `;
            userList.appendChild(row);
          });

          document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              const userId = e.target.getAttribute('data-id');
              try {
                const response = await fetch(`http://localhost:3000/api/deleteUser/${userId}`, {
                  method: 'DELETE'
                });
                const result = await response.json();

                if (response.ok) {
                  loadUsers();
                } else {
                  alert(result.error);
                }
              } catch (err) {
                alert('Unable to connect to the server');
              }
            });
          });
        })
        .catch(err => {
          console.error('Error fetching users:', err);
          userList.innerHTML = '<tr><td colspan="4">Unable to load users</td></tr>';
        });
    };

    loadUsers();

    if (clearUsersBtn) {
      clearUsersBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete all users?')) {
          try {
            const response = await fetch('http://localhost:3000/api/clearUsers', {
              method: 'DELETE'
            });
            const result = await response.json();

            if (response.ok) {
              loadUsers();
            } else {
              alert(result.error);
            }
          } catch (err) {
            alert('Unable to connect to the server');
          }
        }
      });
    }
  }
});