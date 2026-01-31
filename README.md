<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>الصياد برو</title>
    
    <link rel="apple-touch-icon" href="رابط_لوجو_شركتك_هنا.png">
    <meta name="mobile-web-app-capable" content="yes">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/css/intlTelInput.css">
    
    <style>
        body { font-family: 'Cairo', sans-serif; }
        .iti { width: 100% !important; }
        .btn-gradient { background: linear-gradient(90deg, #2563eb, #3b82f6); }
        .card-shadow { box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    </style>
</head>
<body class="bg-slate-50 pb-24">

    <div id="app" class="max-w-md mx-auto min-h-screen relative">
        <header class="bg-white p-5 sticky top-0 z-50 flex justify-between items-center border-b">
            <h1 class="font-black text-2xl text-blue-600" id="shop-name">الصياد برو</h1>
            <button onclick="toggleAdmin()" class="bg-slate-100 p-2 rounded-xl">🔧</button>
        </header>

        <div class="p-4 space-y-3 bg-white m-4 rounded-[30px] card-shadow border border-blue-50 text-center">
            <p class="text-[10px] font-bold text-slate-400">بيانات التوصيل السريع</p>
            <input type="text" id="user-name" placeholder="اسمك الكامل" class="w-full p-3 bg-slate-50 rounded-xl border-none text-center font-bold">
            <input type="tel" id="user-phone" class="w-full p-3 bg-slate-50 rounded-xl font-bold">
        </div>

        <div id="cats-nav" class="flex gap-2 overflow-x-auto p-4 no-scrollbar"></div>
        <div id="products-grid" class="px-4 space-y-4"></div>

        <div id="cart-footer" class="fixed bottom-6 left-4 right-4 z-50 hidden">
            <button onclick="prepareOrder()" class="w-full bg-slate-900 text-white p-5 rounded-[28px] shadow-2xl flex justify-between items-center active:scale-95 transition-all">
                <span id="cart-qty" class="bg-blue-600 px-4 py-1 rounded-full text-xs font-black">0</span>
                <span class="font-black">إتمام الطلب + GPS 📍</span>
                <span id="cart-total" class="font-bold text-blue-400">0 ج</span>
            </button>
        </div>

        <div id="admin-panel" class="fixed inset-0 bg-white z-[100] hidden overflow-y-auto p-6">
            <div class="flex justify-between items-center mb-8 border-b pb-4">
                <h2 class="text-2xl font-black">لوحة التحكم يدوياً</h2>
                <button onclick="toggleAdmin()" class="bg-red-50 text-red-500 p-2 rounded-full px-4">إغلاق</button>
            </div>
            <div id="admin-content"></div>
            <div class="mt-10 space-y-4">
                <button onclick="addCategory()" class="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl font-bold text-slate-400">+ إضافة قسم جديد</button>
                <button onclick="saveAll()" class="w-full p-5 btn-gradient text-white rounded-2xl font-black shadow-lg shadow-blue-200 text-lg">حفظ ونشر التعديلات</button>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/intlTelInput.min.js"></script>
    <script>
        let db = JSON.parse(localStorage.getItem('sayyad_db')) || {
            name: "الصياد برو",
            phone: "201012345678",
            cats: [{ name: "طازج اليوم", products: [{ id: 1, name: "جمبري جامبو", price: 850, img: "" }] }]
        };
        let cart = [];
        let activeCat = 0;
        let iti;

        window.onload = () => {
            iti = window.intlTelInput(document.querySelector("#user-phone"), {
                initialCountry: "eg",
                utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
            });
            render();
        };

        function render() {
            localStorage.setItem('sayyad_db', JSON.stringify(db));
            document.getElementById('shop-name').innerText = db.name;
            
            // Render Cats
            document.getElementById('cats-nav').innerHTML = db.cats.map((c, i) => `
                <button onclick="activeCat=${i};render()" class="px-8 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${activeCat === i ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}">${c.name}</button>
            `).join('');

            // Render Products
            document.getElementById('products-grid').innerHTML = db.cats[activeCat].products.map(p => `
                <div class="bg-white p-3 rounded-[32px] border border-slate-50 flex items-center gap-4 card-shadow" onclick="addToCart(${p.id})">
                    <img src="${p.img || 'https://via.placeholder.com/100?text=Fish'}" class="w-24 h-24 rounded-3xl object-cover bg-slate-50">
                    <div class="flex-1">
                        <h3 class="font-black text-slate-800">${p.name}</h3>
                        <p class="text-blue-600 font-black">${p.price} ج</p>
                    </div>
                    <div class="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">+</div>
                </div>
            `).join('');
            
            updateCart();
            renderAdmin();
        }

        function addToCart(id) {
            const p = db.cats.flatMap(c => c.products).find(x => x.id === id);
            const found = cart.find(x => x.id === id);
            if(found) found.qty++; else cart.push({...p, qty: 1});
            render();
        }

        function updateCart() {
            const footer = document.getElementById('cart-footer');
            if(cart.length > 0) {
                footer.classList.remove('hidden');
                document.getElementById('cart-qty').innerText = cart.length;
                document.getElementById('cart-total').innerText = cart.reduce((a,b) => a + (b.price * b.qty), 0) + ' ج';
            }
        }

        // تحديد الموقع وإرسال الطلب
        function prepareOrder() {
            const name = document.getElementById('user-name').value;
            if(!name || !iti.isValidNumber()) return alert("برجاء إدخال بياناتك أولاً");

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    const loc = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
                    completeOrder(name, loc);
                }, () => completeOrder(name, "لم يتم السماح بالوصول للموقع"));
            } else {
                completeOrder(name, "الموقع غير مدعوم");
            }
        }

        function completeOrder(name, location) {
            let msg = `*طلب جديد من الصياد برو* 🚢\n\n`;
            msg += `👤 العميل: ${name}\n`;
            msg += `📞 الهاتف: ${iti.getNumber()}\n`;
            msg += `📍 الموقع: ${location}\n\n`;
            msg += `*الطلبات:*\n`;
            cart.forEach(item => msg += `- ${item.name} (${item.qty} كجم)\n`);
            msg += `\n*الإجمالي: ${document.getElementById('cart-total').innerText}*`;
            window.open(`https://wa.me/${db.phone}?text=${encodeURIComponent(msg)}`);
        }

        // الإدارة اليدوية
        function toggleAdmin() { document.getElementById('admin-panel').classList.toggle('hidden'); }
        function addCategory() { db.cats.push({ name: "قسم جديد", products: [] }); renderAdmin(); }
        function saveAll() { render(); toggleAdmin(); }

        function renderAdmin() {
            const content = document.getElementById('admin-content');
            content.innerHTML = `
                <div class="space-y-4">
                    <input type="text" value="${db.name}" onchange="db.name=this.value" class="w-full p-4 bg-slate-100 rounded-2xl font-black" placeholder="اسم الشركة">
                    <input type="text" value="${db.phone}" onchange="db.phone=this.value" class="w-full p-4 bg-slate-100 rounded-2xl font-black" placeholder="رقم واتسابك (بالكود الدولي)">
                </div>
                ${db.cats.map((c, ci) => `
                    <div class="mt-8 bg-slate-50 p-4 rounded-3xl">
                        <input type="text" value="${c.name}" onchange="db.cats[${ci}].name=this.value" class="font-black text-blue-600 bg-transparent border-b outline-none mb-4">
                        ${c.products.map((p, pi) => `
                            <div class="grid grid-cols-2 gap-2 mb-2 bg-white p-2 rounded-xl">
                                <input type="text" value="${p.name}" onchange="db.cats[${ci}].products[${pi}].name=this.value" class="text-xs p-1 outline-none">
                                <input type="number" value="${p.price}" onchange="db.cats[${ci}].products[${pi}].price=this.value" class="text-xs p-1 outline-none font-bold">
                                <input type="text" placeholder="رابط صورة ImgBB" value="${p.img}" onchange="db.cats[${ci}].products[${pi}].img=this.value" class="text-[8px] p-1 border col-span-2">
                            </div>
                        `).join('')}
                        <button onclick="db.cats[${ci}].products.push({id:Date.now(), name:'جديد', price:0, img:''});renderAdmin()" class="text-xs text-blue-500 font-bold mt-2">+ إضافة منتج للقسم</button>
                    </div>
                `).join('')}
            `;
        }
    </script>
</body>
</html>
