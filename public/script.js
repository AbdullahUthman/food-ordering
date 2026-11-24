const API_KEY = 'secret123';

const restaurantForm = document.getElementById('restaurantForm');
const menuForm = document.getElementById('menuForm');
const restaurantSelect = document.getElementById('restaurantSelect');
const menuTableBody = document.getElementById('menuTableBody');
const alertBox = document.getElementById('alertBox');

let menuItems = [];

// ---------- Helpers ----------
const showAlert = (message, type = 'danger') => {
  alertBox.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show">
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
};

const escapeHtml = (text) =>
  String(text ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

const api = async (path, options = {}) => {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message || 'Request failed';
    throw new Error(msg);
  }
  return data;
};

// ---------- Load data (async/await) ----------
const loadRestaurants = async () => {
  try {
    const restaurants = await api('/restaurants');
    restaurantSelect.innerHTML = restaurants.length
      ? restaurants.map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('')
      : '<option value="">Add a restaurant first</option>';
  } catch (err) {
    showAlert(err.message);
  }
};

const loadMenuItems = async () => {
  try {
    menuItems = await api('/menu-items');
    renderMenuItems();
  } catch (err) {
    showAlert(err.message);
  }
};

// ---------- Render (DOM manipulation) ----------
const renderMenuItems = () => {
  if (menuItems.length === 0) {
    menuTableBody.innerHTML =
      '<tr><td colspan="6" class="text-center text-muted">No menu items yet.</td></tr>';
    return;
  }

  menuTableBody.innerHTML = menuItems
    .map(
      (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.description)}</td>
        <td>$${Number(item.price).toFixed(2)}</td>
        <td>${escapeHtml(item.restaurant?.name)}</td>
        <td>
          <button class="btn btn-sm btn-warning edit-btn" data-id="${item.id}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}">Delete</button>
        </td>
      </tr>`
    )
    .join('');
};

// ---------- Add restaurant ----------
restaurantForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('restName').value.trim();
  const address = document.getElementById('restAddress').value.trim();

  if (!name) {
    showAlert('Restaurant name must not be empty.');
    return;
  }

  try {
    await api('/restaurants', {
      method: 'POST',
      body: JSON.stringify({ name, address }),
    });
    restaurantForm.reset();
    showAlert('Restaurant added!', 'success');
    await loadRestaurants();
  } catch (err) {
    showAlert(err.message);
  }
});

// ---------- Add menu item ----------
menuForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('itemName').value.trim();
  const description = document.getElementById('itemDescription').value.trim();
  const price = parseFloat(document.getElementById('itemPrice').value);
  const restaurantId = parseInt(restaurantSelect.value, 10);

  // Client-side validation
  if (!restaurantId) return showAlert('Please add/select a restaurant first.');
  if (!name) return showAlert('Name must not be empty.');
  if (isNaN(price) || price <= 0) return showAlert('Price must be a positive number.');

  try {
    await api('/menu-items', {
      method: 'POST',
      body: JSON.stringify({ name, description, price, restaurantId }),
    });
    menuForm.reset();
    showAlert('Menu item added!', 'success');
    await loadMenuItems();
  } catch (err) {
    showAlert(err.message);
  }
});

// ---------- Edit / Delete (event delegation) ----------
menuTableBody.addEventListener('click', async (e) => {
  const id = Number(e.target.dataset.id);
  if (!id) return;

  if (e.target.classList.contains('delete-btn')) {
    if (!confirm('Delete this menu item?')) return;
    try {
      await api(`/menu-items/${id}`, { method: 'DELETE' });
      showAlert('Menu item deleted.', 'success');
      await loadMenuItems();
    } catch (err) {
      showAlert(err.message);
    }
  }

  if (e.target.classList.contains('edit-btn')) {
    const item = menuItems.find((m) => m.id === id);
    const name = prompt('New name:', item.name);
    if (name === null) return;
    const price = parseFloat(prompt('New price:', item.price));

    if (!name.trim()) return showAlert('Name must not be empty.');
    if (isNaN(price) || price <= 0) return showAlert('Price must be a positive number.');

    try {
      await api(`/menu-items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim(), price }),
      });
      showAlert('Menu item updated.', 'success');
      await loadMenuItems();
    } catch (err) {
      showAlert(err.message);
    }
  }
});

// ---------- Init ----------
loadRestaurants();
loadMenuItems();