// DOM Elements
const taskBtn = document.getElementById('taskBtn');
const eventBtn = document.getElementById('eventBtn');
const itemForm = document.getElementById('itemForm');
const itemName = document.getElementById('itemName');
const itemTime = document.getElementById('itemTime');
const itemDate = document.getElementById('itemDate');
const dateRequired = document.getElementById('dateRequired');
const addBtn = document.getElementById('addBtn');
const tasksList = document.getElementById('tasksList');
const eventsList = document.getElementById('eventsList');

// App State
let currentType = 'task';
let items = {
    tasks: [],
    events: []
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadFromStorage();
    renderItems();
    updateEmptyMessages();
});

// Type Selection
taskBtn.addEventListener('click', () => selectType('task'));
eventBtn.addEventListener('click', () => selectType('event'));

function selectType(type) {
    currentType = type;
    
    // Update button states
    taskBtn.classList.toggle('active', type === 'task');
    eventBtn.classList.toggle('active', type === 'event');
    
    // Update add button text
    addBtn.textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    
    // Show/hide date required indicator
    if (type === 'event') {
        dateRequired.style.display = 'inline';
        itemDate.setAttribute('required', 'required');
    } else {
        dateRequired.style.display = 'none';
        itemDate.removeAttribute('required');
    }
}

// Form Submission
itemForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = itemName.value.trim();
    const time = itemTime.value;
    const date = itemDate.value;
    
    // Validation based on type
    if (!name || !time) {
        alert('Please fill in all required fields (Name and Time)');
        return;
    }
    
    if (currentType === 'event' && !date) {
        alert('Date is required for events');
        return;
    }
    
    const newItem = {
        id: Date.now(),
        name: name,
        time: time,
        date: date || null,
        type: currentType,
        completed: false,
        createdAt: new Date()
    };
    
    // Add to appropriate array
    if (currentType === 'task') {
        items.tasks.push(newItem);
    } else {
        items.events.push(newItem);
    }
    
    // Save to localStorage
    saveToStorage();
    
    // Reset form
    itemForm.reset();
    
    // Re-render items
    renderItems();
    updateEmptyMessages();
});

// Render Items
function renderItems() {
    renderTasksList();
    renderEventsList();
}

function renderTasksList() {
    tasksList.innerHTML = '';
    
    items.tasks.forEach(task => {
        const listItem = createItemElement(task);
        tasksList.appendChild(listItem);
    });
}

function renderEventsList() {
    eventsList.innerHTML = '';
    
    items.events.forEach(event => {
        const listItem = createItemElement(event);
        eventsList.appendChild(listItem);
    });
}

function createItemElement(item) {
    const li = document.createElement('li');
    li.className = `item ${item.type} ${item.completed ? 'completed' : ''}`;
    
    // Format time for display
    const formattedTime = formatTime(item.time);
    
    // Format date for display
    const formattedDate = item.date ? formatDate(item.date) : null;
    
    li.innerHTML = `
        <div class="item-header">
            <div class="item-left">
                <input type="checkbox" class="item-checkbox" ${item.completed ? 'checked' : ''} onchange="toggleComplete(${item.id})">
                <div class="item-name">${escapeHtml(item.name)}</div>
            </div>
            <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
        </div>
        <div class="item-details">
            <span class="item-time">⏰ ${formattedTime}</span>
            ${formattedDate ? `<span class="item-date">📅 ${formattedDate}</span>` : ''}
        </div>
    `;
    
    return li;
}

// Toggle Complete Status
function toggleComplete(id) {
    // Find and toggle in tasks
    const task = items.tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
    }
    
    // Find and toggle in events
    const event = items.events.find(event => event.id === id);
    if (event) {
        event.completed = !event.completed;
    }
    
    // Save and re-render
    saveToStorage();
    renderItems();
    updateEmptyMessages();
}

// Delete Item
function deleteItem(id) {
    // Remove from tasks
    items.tasks = items.tasks.filter(task => task.id !== id);
    
    // Remove from events
    items.events = items.events.filter(event => event.id !== id);
    
    // Save and re-render
    saveToStorage();
    renderItems();
    updateEmptyMessages();
}

// Update Empty Messages
function updateEmptyMessages() {
    // Tasks empty message
    if (items.tasks.length === 0) {
        tasksList.innerHTML = '<li class="empty-message">No tasks yet. Add your first task!</li>';
    }
    
    // Events empty message
    if (items.events.length === 0) {
        eventsList.innerHTML = '<li class="empty-message">No events yet. Add your first event!</li>';
    }
}

// Storage Functions
function saveToStorage() {
    try {
        // Note: In a real environment, this would use localStorage
        // For this demo, we'll just keep items in memory
        console.log('Items saved:', items);
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
}

function loadFromStorage() {
    try {
        // Note: In a real environment, this would load from localStorage
        // For this demo, we'll start with empty items
        console.log('Items loaded:', items);
    } catch (error) {
        console.error('Error loading from storage:', error);
        items = { tasks: [], events: [] };
    }
}

// Utility Functions
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Sort items by time (optional feature)
function sortItemsByTime() {
    items.tasks.sort((a, b) => a.time.localeCompare(b.time));
    items.events.sort((a, b) => a.time.localeCompare(b.time));
    renderItems();
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (itemName.value.trim() && itemTime.value) {
            itemForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Tab to switch between task/event
    if (e.key === 'Tab' && e.target === eventBtn) {
        // Let default tab behavior work
    }
});