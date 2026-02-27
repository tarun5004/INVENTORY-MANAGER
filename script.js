

var defaultData = [
    {
        productName: "Amul Milk 500ml",
        category: "Dairy",
        costPrice: 22,
        sellingPrice: 28,
        quantityInStock: 120,
        expiryDate: "2026-03-02"
    },
    {
        productName: "Tata Toor Dal 1kg",
        category: "Groceries",
        costPrice: 130,
        sellingPrice: 165,
        quantityInStock: 60,
        expiryDate: "2026-08-15"
    },
    {
        productName: "Lay's Chips 50g",
        category: "Snacks",
        costPrice: 12,
        sellingPrice: 20,
        quantityInStock: 8,
        expiryDate: "2026-06-10"
    }
];

// localStorage se data load karo, agar nahi mila toh defaultData use karo
var inventory = JSON.parse(localStorage.getItem('inventory')) || defaultData;


// 2. DOM ELEMENTS SELECT KARO
var form = document.getElementById('product-form');
var allData = document.getElementById('all-data');
var submitBtn = document.getElementById('submit-btn');
var searchInput = document.getElementById('search-input');

// Form ke andar ke inputs (by ID - ye childNodes se zyada clean hai)
var productNameInput = document.getElementById('productName');
var categoryInput = document.getElementById('category');
var costPriceInput = document.getElementById('costPrice');
var sellingPriceInput = document.getElementById('sellingPrice');
var quantityInput = document.getElementById('quantity');
var expiryDateInput = document.getElementById('expiryDate');

// Stats elements
var totalProductsEl = document.getElementById('total-products');
var totalValueEl = document.getElementById('total-value');
var lowStockEl = document.getElementById('low-stock');


//  3. EDIT MODE TRACKING 
// editIndex = -1 matlab koi edit nahi ho raha (ADD mode)
// editIndex = 0,1,2... matlab us index ka product edit ho raha hai
var editIndex = -1;


// 4. SAVE TO LOCALSTORAGE
// Har baar jab inventory change ho → localStorage mein save karo
function saveData() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}


// 5. UPDATE STATS
function updateStats() {
    // Total products = inventory array ki length
    totalProductsEl.textContent = inventory.length;

    // Total stock value = sum of (sellingPrice × quantity) for each item
    var totalValue = 0;
    var lowCount = 0;

    for (var i = 0; i < inventory.length; i++) {
        totalValue += inventory[i].sellingPrice * inventory[i].quantityInStock;

        // Low stock = quantity < 10
        if (inventory[i].quantityInStock < 10) {
            lowCount++;
        }
    }

    totalValueEl.textContent = '₹' + totalValue.toLocaleString();
    lowStockEl.textContent = lowCount;
}


// 6. RENDER/PRINT DATA ON SCREEN
// Ye function saari cards banata hai aur screen pe dikhata hai
function printData(dataToShow) {
    // agar koi filtered data pass hua toh wo dikhao, warna poora inventory
    var data = dataToShow || inventory;

    // Agar data empty hai toh message dikhao
    if (data.length === 0) {
        allData.innerHTML = '<p class="empty-message">No products found. Add some! 📦</p>';
        updateStats();
        return;
    }

    var sum = '';

    for (var i = 0; i < data.length; i++) {
        var elem = data[i];

        // Profit calculate karo
        var profit = elem.sellingPrice - elem.costPrice;
        var profitClass = profit >= 0 ? 'profit' : 'loss';
        var profitText = profit >= 0 ? '+₹' + profit : '-₹' + Math.abs(profit);

        // Low stock check (quantity < 10)
        var lowStockTag = '';
        if (elem.quantityInStock < 10) {
            lowStockTag = '<p class="low-stock-warning">⚠ Low Stock!</p>';
        }

        // Find the REAL index in inventory (important for search filter)
        var realIndex = inventory.indexOf(elem);

        sum += '<div class="item">'
            + '<h3>' + elem.productName + '</h3>'
            + '<span class="badge">' + elem.category + '</span>'
            + '<h4>Cost Price : <span>₹' + elem.costPrice + '</span></h4>'
            + '<h4>Selling Price : <span>₹' + elem.sellingPrice + '</span></h4>'
            + '<h4>Profit : <span class="' + profitClass + '">' + profitText + '</span></h4>'
            + '<h4>Quantity : <span>' + elem.quantityInStock + '</span></h4>'
            + lowStockTag
            + '<h4>Expiry : <span>' + elem.expiryDate + '</span></h4>'
            + '<div class="actions">'
            + '    <button class="edit-btn" data-index="' + realIndex + '">Edit</button>'
            + '    <button class="remove-btn" data-index="' + realIndex + '">Remove</button>'
            + '</div>'
            + '</div>';
    }

    allData.innerHTML = sum;
    updateStats();
}


// 7. FORM SUBMIT HANDLER (ADD + UPDATE)
form.addEventListener('submit', function (e) {
    // Page reload rokko
    e.preventDefault();

    // Form se values lo
    var newProduct = {
        productName: productNameInput.value.trim(),
        category: categoryInput.value,
        costPrice: Number(costPriceInput.value),
        sellingPrice: Number(sellingPriceInput.value),
        quantityInStock: Number(quantityInput.value),
        expiryDate: expiryDateInput.value
    };

    // Check: ADD mode ya EDIT mode?
    if (editIndex === -1) {
        // ==== ADD MODE ====
        // Naya product array mein push karo
        inventory.push(newProduct);
    } else {
        // ==== EDIT MODE ====
        // Purana product replace karo nayi values se
        inventory[editIndex] = newProduct;

        // Edit mode se bahar aao
        editIndex = -1;
        submitBtn.textContent = 'Add Product';
        submitBtn.classList.remove('editing');
    }

    // Save + Render + Reset
    saveData();
    form.reset();
    printData();
});


// 8. CLICK HANDLER FOR EDIT & REMOVE
// Event Delegation: Parent pe listener lagao, child pe check karo
allData.addEventListener('click', function (e) {

    // ---- REMOVE BUTTON ----
    if (e.target.classList.contains('remove-btn')) {
        var removeIdx = Number(e.target.getAttribute('data-index'));

        // Confirmation lo user se
        var confirmDelete = confirm('Are you sure you want to remove this product?');
        if (confirmDelete) {
            inventory.splice(removeIdx, 1);
            saveData();
            printData();
        }
    }

    // ---- EDIT BUTTON ----
    if (e.target.classList.contains('edit-btn')) {
        var editIdx = Number(e.target.getAttribute('data-index'));
        var product = inventory[editIdx];

        // Form mein values bharo
        productNameInput.value = product.productName;
        categoryInput.value = product.category;
        costPriceInput.value = product.costPrice;
        sellingPriceInput.value = product.sellingPrice;
        quantityInput.value = product.quantityInStock;
        expiryDateInput.value = product.expiryDate;

        // Edit mode ON karo
        editIndex = editIdx;
        submitBtn.textContent = 'Update Product';
        submitBtn.classList.add('editing');

        // Form pe scroll karo (smooth UX)
        form.scrollIntoView({ behavior: 'smooth' });
    }
});


// 9. SEARCH FEATURE
searchInput.addEventListener('input', function () {
    var query = searchInput.value.toLowerCase().trim();

    if (query === '') {
        // Search empty hai toh sab dikhao
        printData();
        return;
    }

    // Filter karo: product name mein query match ho toh dikhao
    var filtered = [];
    for (var i = 0; i < inventory.length; i++) {
        if (inventory[i].productName.toLowerCase().includes(query)) {
            filtered.push(inventory[i]);
        }
    }

    printData(filtered);
});


// 10. INITIAL RENDER
// Page load hote hi data dikhao
printData();

