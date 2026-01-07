const defaultData = [
    {
        id: 1,
        title: "List1",
        expanded: true,
        items: [
            { id: 101, text: "Item1", completed: false, link: "" },
            { id: 102, text: "Item2", completed: true, link: "" },
            { id: 103, text: "Item3", completed: false, link: "" }
        ]
    }
];

let lists = JSON.parse(localStorage.getItem('myListManagerData')) || defaultData;
const app = document.getElementById('app');
const addListBtn = document.getElementById('addListBtn');
const themeToggleBtn = document.getElementById('themeToggle');

// Drag and Drop State
let draggedItem = null;
let draggedList = null;
let draggedListExpandedState = null;
let nearestDropTarget = null;

const ICONS = {
    add: `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
    link: `<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>`,
    pencil: `<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`
};

function initTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
}

themeToggleBtn.onclick = () => {
    document.body.classList.toggle('dark-mode');
    const mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', mode);
};

function saveData() {
    localStorage.setItem('myListManagerData', JSON.stringify(lists));
    render();
}

function toggleExpand(listId) {
    const list = lists.find(l => l.id === listId);
    if (list) {
        list.expanded = !list.expanded;
        saveData();
    }
}

function toggleComplete(listId, itemId) {
    const list = lists.find(l => l.id === listId);
    const item = list.items.find(i => i.id === itemId);
    if (item) {
        item.completed = !item.completed;
        saveData();
    }
}

function addNewList() {
    const title = prompt("Enter new list name:");
    if (title) {
        lists.push({
            id: Date.now(),
            title: title,
            expanded: true,
            items: []
        });
        saveData();
    }
}

function addEntry(listId) {
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const text = prompt(`Add new item to "${list.title}":`);
    if (text) {
        list.items.push({
            id: Date.now(),
            text: text,
            completed: false,
            link: "" 
        });
        list.expanded = true; 
        saveData();
    }
}

function deleteList(listId, e) {
    e.stopPropagation(); 
    if(confirm("Are you sure you want to delete this entire list?")) {
        lists = lists.filter(l => l.id !== listId);
        saveData();
    }
}

function deleteItem(listId, itemId) {
    if(confirm("Delete this item?")) {
        const list = lists.find(l => l.id === listId);
        list.items = list.items.filter(i => i.id !== itemId);
        saveData();
    }
}

function updateLink(listId, itemId) {
    const list = lists.find(l => l.id === listId);
    const item = list.items.find(i => i.id === itemId);
    
    const newLink = prompt("Enter URL:", item.link || "https://");
    if (newLink !== null) {
        item.link = newLink;
        saveData();
    }
}

function openLink(url, listId, itemId) {
    if (!url) {
        // If empty, treat as edit request
        updateLink(listId, itemId);
    } else {
        window.open(url, '_blank');
    }
}

addListBtn.onclick = addNewList;

function findNearestElement(x, y, elements) {
    let nearest = null;
    let minDistance = Infinity;
    
    elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        
        if (distance < minDistance) {
            minDistance = distance;
            nearest = el;
        }
    });
    
    return nearest;
}

function handleListDragStart(e, listId) {
    const list = lists.find(l => l.id === listId);
    draggedList = listId;
    draggedListExpandedState = list.expanded;
    
    if (list.expanded) {
        list.expanded = false;
        localStorage.setItem('myListManagerData', JSON.stringify(lists));
        render();
    }
    
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

function handleListDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedList !== null) {
        const allDropZones = Array.from(document.querySelectorAll('.list-drop-zone'));
        const nearest = findNearestElement(e.clientX, e.clientY, allDropZones);
        
        if (nearest !== nearestDropTarget) {
            if (nearestDropTarget) {
                nearestDropTarget.classList.remove('drag-over');
            }
            if (nearest) {
                nearest.classList.add('drag-over');
            }
            nearestDropTarget = nearest;
        }
    }
    
    return false;
}

function handleListDrop(e, dropIndex) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (nearestDropTarget) {
        dropIndex = parseInt(nearestDropTarget.getAttribute('data-drop-index'));
        nearestDropTarget.classList.remove('drag-over');
    }
    
    if (draggedList !== null) {
        const draggedIndex = lists.findIndex(l => l.id === draggedList);
        const [removed] = lists.splice(draggedIndex, 1);
        
        // Adjust drop index if dragging down
        const adjustedIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
        lists.splice(adjustedIndex, 0, removed);
        
        saveData();
    }
    
    return false;
}

function handleListDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.list-drop-zone').forEach(zone => {
        zone.classList.remove('drag-over');
    });
    
    if (draggedList !== null && draggedListExpandedState !== null) {
        const list = lists.find(l => l.id === draggedList);
        if (list) {
            list.expanded = draggedListExpandedState;
            localStorage.setItem('myListManagerData', JSON.stringify(lists));
            render();
        }
    }
    
    draggedList = null;
    draggedListExpandedState = null;
    nearestDropTarget = null;
}

function handleItemDragStart(e, listId, itemId) {
    draggedItem = { listId, itemId };
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    e.stopPropagation();
}

function handleItemDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedItem !== null) {
        const allItems = Array.from(document.querySelectorAll('.item'));
        const validItems = allItems.filter(el => {
            const listId = parseInt(el.getAttribute('data-list-id'));
            const itemId = parseInt(el.getAttribute('data-item-id'));
            return !(listId === draggedItem.listId && itemId === draggedItem.itemId);
        });
        
        const nearest = findNearestElement(e.clientX, e.clientY, validItems);
        
        if (nearest !== nearestDropTarget) {
            if (nearestDropTarget) {
                nearestDropTarget.classList.remove('drag-over');
            }
            if (nearest) {
                nearest.classList.add('drag-over');
            }
            nearestDropTarget = nearest;
        }
    }
    
    return false;
}

function handleItemDrop(e, targetListId, targetItemId) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (nearestDropTarget) {
        targetListId = parseInt(nearestDropTarget.getAttribute('data-list-id'));
        targetItemId = parseInt(nearestDropTarget.getAttribute('data-item-id'));
        nearestDropTarget.classList.remove('drag-over');
    }
    
    if (draggedItem !== null) {
        const sourceList = lists.find(l => l.id === draggedItem.listId);
        const targetList = lists.find(l => l.id === targetListId);
        
        const sourceIndex = sourceList.items.findIndex(i => i.id === draggedItem.itemId);
        const targetIndex = targetList.items.findIndex(i => i.id === targetItemId);
        
        if (draggedItem.listId === targetListId) {
            const [removed] = sourceList.items.splice(sourceIndex, 1);
            sourceList.items.splice(targetIndex, 0, removed);
        } else {
            const [removed] = sourceList.items.splice(sourceIndex, 1);
            targetList.items.splice(targetIndex, 0, removed);
        }
        
        saveData();
    }
    
    return false;
}

function handleItemDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.item').forEach(item => {
        item.classList.remove('drag-over');
    });
    draggedItem = null;
    nearestDropTarget = null;
}

function render() {
    app.innerHTML = '';

    lists.forEach((list, index) => {
        const dropZoneBefore = document.createElement('div');
        dropZoneBefore.className = 'list-drop-zone';
        dropZoneBefore.setAttribute('data-drop-index', index);
        dropZoneBefore.ondragover = handleListDragOver;
        dropZoneBefore.ondrop = (e) => handleListDrop(e, index);
        app.appendChild(dropZoneBefore);
        
        const container = document.createElement('div');
        container.className = 'list-container';
        container.draggable = true;
        container.ondragstart = (e) => handleListDragStart(e, list.id);
        container.ondragend = handleListDragEnd;

        const header = document.createElement('div');
        header.className = 'list-header';
        
        const headerLeft = document.createElement('div');
        headerLeft.className = 'list-header-left';
        headerLeft.onclick = () => toggleExpand(list.id);
        
        const arrow = document.createElement('span');
        arrow.className = `arrow ${list.expanded ? 'rotated' : ''}`;
        arrow.textContent = '▶'; 
        
        const title = document.createElement('span');
        title.className = 'list-title';
        title.textContent = list.title;

        headerLeft.appendChild(arrow);
        headerLeft.appendChild(title);

        const headerRight = document.createElement('div');
        headerRight.className = 'list-header-right';
        
        const addEntryBtn = document.createElement('button');
        addEntryBtn.className = 'btn-icon'; 
        addEntryBtn.innerHTML = `${ICONS.add} Add Entry`;
        addEntryBtn.onclick = (e) => {
            e.stopPropagation(); 
            addEntry(list.id);
        };

        const delListBtn = document.createElement('button');
        delListBtn.className = 'delete-list-btn';
        delListBtn.textContent = '✖';
        delListBtn.title = "Delete List";
        delListBtn.onclick = (e) => deleteList(list.id, e);

        headerRight.appendChild(addEntryBtn);
        headerRight.appendChild(delListBtn);

        header.appendChild(headerLeft);
        header.appendChild(headerRight);

        const body = document.createElement('div');
        body.className = `list-items ${list.expanded ? 'open' : ''}`;

        if (list.items.length === 0) {
            body.innerHTML = '<div class="empty-msg">No items yet...</div>';
        } else {
            list.items.forEach(item => {
                const itemRow = document.createElement('div');
                itemRow.className = `item ${item.completed ? 'completed' : ''}`;
                itemRow.setAttribute('data-list-id', list.id);
                itemRow.setAttribute('data-item-id', item.id);
                itemRow.draggable = true;
                itemRow.ondragstart = (e) => handleItemDragStart(e, list.id, item.id);
                itemRow.ondragover = handleItemDragOver;
                itemRow.ondrop = (e) => handleItemDrop(e, list.id, item.id);
                itemRow.ondragend = handleItemDragEnd;

                const itemLeft = document.createElement('div');
                itemLeft.className = 'item-left';
                itemLeft.onclick = () => toggleComplete(list.id, item.id);

                const circle = document.createElement('div');
                circle.className = 'status-circle';

                const text = document.createElement('div');
                text.className = 'item-text';
                text.textContent = item.text;

                itemLeft.appendChild(circle);
                itemLeft.appendChild(text);

                const itemRight = document.createElement('div');
                itemRight.className = 'item-right';

                const deleteItemBtn = document.createElement('button');
                deleteItemBtn.className = 'delete-item-btn';
                deleteItemBtn.innerHTML = ICONS.trash; // Using trash icon or X
                deleteItemBtn.title = "Delete Item";
                deleteItemBtn.onclick = () => deleteItem(list.id, item.id);

                const linkGroup = document.createElement('div');
                linkGroup.className = 'smart-link-group';

                const linkAction = document.createElement('div');
                linkAction.className = 'link-action';
                linkAction.innerHTML = `${ICONS.link} Link`;
                linkAction.onclick = () => openLink(item.link, list.id, item.id);

                const linkEdit = document.createElement('div');
                linkEdit.className = 'link-edit';
                linkEdit.innerHTML = ICONS.pencil;
                linkEdit.title = "Edit Link URL";
                linkEdit.onclick = (e) => {
                    e.stopPropagation();
                    updateLink(list.id, item.id);
                };

                linkGroup.appendChild(linkAction);
                linkGroup.appendChild(linkEdit);

                itemRight.appendChild(deleteItemBtn);
                itemRight.appendChild(linkGroup);

                itemRow.appendChild(itemLeft);
                itemRow.appendChild(itemRight);
                body.appendChild(itemRow);
            });
        }

        container.appendChild(header);
        container.appendChild(body);
        app.appendChild(container);
    });
    
    const dropZoneAfter = document.createElement('div');
    dropZoneAfter.className = 'list-drop-zone';
    dropZoneAfter.setAttribute('data-drop-index', lists.length);
    dropZoneAfter.ondragover = handleListDragOver;
    dropZoneAfter.ondrop = (e) => handleListDrop(e, lists.length);
    app.appendChild(dropZoneAfter);
}

initTheme();
render();