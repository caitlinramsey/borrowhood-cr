document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Fetch your items
    const myItemsResponse = await fetch('/api/items/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const myItemsData = await myItemsResponse.json();
    const myItems = myItemsData || [];

    // Fetch the items you have borrowed
    const borrowedItemsResponse = await fetch('/api/borrows/mine', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const borrowedItemsData = await borrowedItemsResponse.json();
    const borrowedItems = borrowedItemsData || [];

    // Fetch the pending item requests
    const pendingItemResponse = await fetch('/api/users/requests/pending', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const pendingItemData = await pendingItemResponse.json();
    const pendingItem = pendingItemData || [];

    // Render my items
    myItems.forEach(item => {
      // Render your item cards using the 'item' variable
      const borrowedByElement = document.getElementById(
        `borrowedBy-${item.id}`
      );
      if (borrowedByElement) {
        if (item.borrowed_by) {
          fetch(`/api/users/${item.borrowed_by}`)
            .then(response => response.json())
            .then(user => {
              borrowedByElement.textContent = `Borrowed by ${user.firstName}`;
            })
            .catch(error => {
              console.error('2', error);
              borrowedByElement.textContent = `Borrowed by unknown user`;
            });
        } else {
          console.error('Failed to approve request');
        }
      } catch (error) {
        console.error(error);
      }
    }
  });

  document.addEventListener('click', async event => {
    if (event.target.classList.contains('deny-button')) {
      const userId = event.target.getAttribute('data-user-id');
      const requestId = event.target.getAttribute('data-request-id');
      try {
        const response = await fetch(
          `/api/users/${userId}/requests/${requestId}`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          }
        );
        if (response.ok) {
          console.log('Request denied!');
          location.reload();
        } else {
          console.error('Failed to deny request');
        }
      });
    }

    // Render my pending item requests
    pendingItem.forEach(async request => {
      const requestStatusElement = document.getElementById(
        `requestStatus-${request.id}`
      );
      if (requestStatusElement) {
        requestStatusElement.textContent = `Request Status: ${request.request_status}`;
      }
    });
  } catch (error) {
    console.error(error);
  }
});

const addItemHandler = async event => {
  event.preventDefault();

  const item_name = document.querySelector('#item_name').value.trim();
  const item_description = document
    .querySelector('#item_description')
    .value.trim();
  const item_condition = document.querySelector('#item_condition').value.trim();

  if (item_name && item_description && item_condition) {
    const response = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify({
        item_name,
        item_description,
        item_condition,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (response.ok) {
      document.location.replace('/dashboard');
    } else {
      const alert = createAlert('An error occurred. Please try again.');
      appendAlert(alert);
    }
  } else {
    const alert = createAlert('Please make sure all fields are filled out.');
    appendAlert(alert);
  }
};

const createAlert = message => {
  const alert = document.createElement('div');
  alert.className = 'alert alert-error';
  alert.innerHTML = `
    <svg xmlns='http://www.w3.org/2000/svg' class='stroke-current shrink-0 h-6 w-6' fill='none' viewBox='0 0 24 24'>
      <path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' />
    </svg>
    <span>${message}</span>
  `;

  return alert;
};

const appendAlert = alert => {
  const registrationAlert = document.getElementById('add-item-alert');
  registrationAlert.innerHTML = '';
  registrationAlert.appendChild(alert);
};

document
  .querySelector('.add-item-form')
  .addEventListener('submit', addItemHandler);
