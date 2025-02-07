
function render(section){
  if (section === 'citizens') {
          dashboard.render('citizens');
    // التأكد من أن العنصر موجود في DOM قبل تنفيذ الكود
    fetch('http://localhost:5000/api/auth/citizens')
.then(response => response.json())
.then(data => {
  const citizensTable = document.querySelector('#citizensTable tbody');
  citizensTable.innerHTML = ''; // تفريغ الجدول قبل إضافة البيانات
  data.forEach((citizen) => {
    const row = `<tr>
      <td class='p-2 border'>${citizen.fullName}</td>
      <td class='p-2 border'>${citizen.email}</td>
      <td class='p-2 border'>${citizen.walletAddress}</td>
      <td class='p-2 border'>${citizen.city}</td>
      <td class='p-2 border'>${citizen.birth}</td>
      <td class='p-2 border'>${citizen.role}</td>
      <td class='p-2 border'>
        <button class='px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition' onclick='deleteCitizen("${citizen._id}")'>حذف</button>
       <button class='px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition' onclick='viewDocuments("${citizen._id}")'>عرض الوثائق</button>

        </td>

    </tr>`;
    citizensTable.innerHTML += row;
  });
})
.catch(error => console.error('Error fetching citizens:', error));}

  if (section === 'documents') {
          dashboard.render('documents');
          // التأكد من أن العنصر موجود في DOM قبل تنفيذ الكود
          const tableBody = document.getElementById('documentsTable')?.getElementsByTagName('tbody')[0];

          if (!tableBody) {
            console.error('جدول الوثائق غير موجود');
            return;
          }

          // جلب الوثائق من الخادم
          fetch('http://localhost:5000/api/documents')
            .then(response => response.json())
            .then(documents => {
              tableBody.innerHTML = ''; // مسح أي بيانات سابقة

              // إضافة كل وثيقة في الجدول
              documents.forEach(doc => {
                const row = tableBody.insertRow();

                // إضافة البيانات إلى الخلايا
                row.insertCell(0).textContent = doc.type;
                row.insertCell(1).textContent = doc.fullname;
                row.insertCell(2).textContent = doc.walletAddress;

                // إضافة زر الحذف وزر الإرسال
                const actionsCell = row.insertCell(3);
                actionsCell.innerHTML = `
                  <button class="px-2 py-1 bg-red-600 text-white rounded hover:bg-green-700 transition" onclick="deleteDocument('${doc._id}')">حذف</button>
                  <button class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-green-700 transition" onclick="sendDocument('${doc._id}')">إرسال</button>
                `;
              });
            })
            .catch(error => {
              console.error('حدث خطأ أثناء تحميل الوثائق:', error);
              alert('حدث خطأ أثناء تحميل الوثائق');
            });

          // دالة حذف الوثيقة


              }

        if (section === 'requests') {
          dashboard.render('requests');
          fetch('http://localhost:5000/api/requests')
          .then(response => response.json())
          .then(data => {
            const requestsTable = document.querySelector('#req');
            requestsTable.innerHTML = ''; // تفريغ الجدول قبل إضافة البيانات

            data.forEach((request) => {
              const row = `<tr>
                <td class='p-2 border'>${request.fullName}</td>
                <td class='p-2 border'>${request.walletAddress}</td>
                <td class='p-2 border'>${request.requestType}</td>
                <td class='p-2 border'>${new Date(request.requestDate).toLocaleDateString()}</td>
                <td class='p-2 border'>
          <button class='px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition' onclick='deleteRequest("${request._id}")'>تمت مشاهدة 👁</button>
                </td>
              </tr>`;
              requestsTable.innerHTML += row;
            });
          })
          .catch(error => console.error('خطأ في جلب الطلبات:', error));
        }
          if (section === 'settings') {
                  dashboard.render('settings');  }
}

function openModal1() {
  document.getElementById('documentModall').classList.remove('hidden');
}
// إخفاء النموذج
function closeModal1() {
  document.getElementById('documentModall').classList.add('hidden');
}
// دالة لتحميل قائمة المواطنين عند الضغط على حقل "اسم المواطن"
function loadCitizensList() {
  // إرسال طلب API للحصول على جميع المواطنين
  fetch('http://localhost:5000/api/auth/citizens')
      .then(response => response.json())
      .then(citizens => {
          const citizenList = document.getElementById('citizenList');
          citizenList.innerHTML = ''; // إعادة تعيين القائمة
          citizenList.classList.remove('hidden'); // إظهار القائمة

          citizens.forEach(citizen => {
              const div = document.createElement('div');
              div.classList.add('cursor-pointer', 'p-2', 'hover:bg-gray-200');
              div.textContent = citizen.fullName; // عرض اسم المواطن
              div.onclick = function () {
                  selectCitizen(citizen);
              };
              citizenList.appendChild(div);
          });
      })
      .catch(error => {
          console.error("خطأ في جلب المواطنين:", error);
          alert("حدث خطأ أثناء جلب المواطنين.");
      });
}

// دالة لاختيار المواطن من القائمة
function selectCitizen(citizen) {
  // ملء الحقول تلقائيًا عند اختيار المواطن
  document.getElementById('citizenFullName').value = citizen.fullName;
  document.getElementById('citizenId').value = citizen._id; // _id كرقم هوية المواطن

  // إخفاء القائمة بعد الاختيار
  document.getElementById('citizenList').classList.add('hidden');
}

// دالة لإصدار الوثيقة (تقوم بإرسال البيانات إلى الخادم)
function issueDocument() {
const documentType = document.getElementById('documentType').value;
const citizenId = document.getElementById('citizenId').value;
const citizenFullName = document.getElementById('citizenFullName').value;
const documentFile = document.getElementById('documentFile').files[0];  // رفع الملف

if (!documentType || !citizenId || !documentFile) {
    alert("يرجى ملء جميع الحقول بما في ذلك رفع ملف PDF.");
    return;
}

// إعداد بيانات الوثيقة
const formData = new FormData();
formData.append('type', documentType);
formData.append('issuedTo', citizenId);
formData.append('fullname', citizenFullName);
formData.append('documentFile', documentFile);  // إضافة الملف إلى البيانات

fetch('http://localhost:5000/api/documents/create', {
    method: 'POST',
    body: formData,
})
.then(response => response.json())
.then(data => {
    alert(data.message);
    closeModal1(); // إغلاق النموذج بعد النجاح
    location.reload();
})
.catch(error => {
    console.error("خطأ أثناء إصدار الوثيقة:", error);
    alert("حدث خطأ أثناء إصدار الوثيقة.");
});
}

// وظيفة لعرض الوثائق عند الضغط على الزر


function viewDocuments(citizenId) {
  fetch(`http://localhost:5000/api/documents/documents/${citizenId}`) // جلب الوثائق الخاصة بالمواطن
    .then(response => response.json())
    .then(documents => {
      const table = document.querySelector('#citizensTable'); // تحديد الجدول
      const tableHead = table.querySelector('thead'); // رأس الجدول
      const tableBody = table.querySelector('tbody'); // جسم الجدول

      // تغيير عناوين الأعمدة عند عرض الوثائق
      tableHead.innerHTML = `
        <tr class="bg-gray-200">
          <th class="p-2 text-right">نوع الوثيقة</th>
          <th class="p-2 text-right">تاريخ الإصدار</th>
          <th class="p-2 text-right"> عنوان المحفظة</th>
          <th class="p-2 text-right">الإجراءات</th>
        </tr>
      `;

      tableBody.innerHTML = ''; // مسح أي بيانات سابقة

      if (documents.length > 0) {
        // إضافة كل وثيقة في الجدول
        documents.forEach(doc => {
          const row = tableBody.insertRow();

          // إضافة البيانات إلى الخلايا
          row.insertCell(0).textContent = doc.type;
          row.insertCell(1).textContent = doc.issueDate || 'تاريخ الإصدار غير محدد';
          row.insertCell(2).textContent = doc.walletAddress || 'المواطن غير محدد';

          // إضافة زر رجوع
          const actionsCell = row.insertCell(3);
          actionsCell.innerHTML = `
            <button class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition" onclick="render('citizens')">رجوع</button>
        <button class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition" onclick="deleteDocument('${doc._id}')">حذف</button>
     <button class="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition" onclick="sendDocument('${doc._id}')">إرسال</button>
            `;
        });
      } else {
        const row = tableBody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 4; // دمج الأعمدة
        cell.classList.add("text-center", "p-4");
        cell.innerHTML = `
          لا توجد وثائق لهذا المواطن
          <br>
          <button class="mt-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-green-700 transition" onclick="render('citizens')">رجوع</button>
        `;
      }
    })
    .catch(error => {
      console.error('Error fetching documents:', error);
      alert('حدث خطأ أثناء تحميل الوثائق');
    });
}

dashboard.searchd = function () {
  const query = document.getElementById('searchd').value.toLowerCase();
  const rows = document.querySelectorAll('#documentsTable tbody tr');

  rows.forEach(row => {
      const walletAddress = row.cells[2].textContent.toLowerCase(); // العمود الثالث يحتوي عنوان المحفظة
      if (walletAddress.includes(query)) {
          row.style.display = '';
      } else {
          row.style.display = 'none';
      }
  });
};

