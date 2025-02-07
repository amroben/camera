document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll("[data-section]");
    const content = document.getElementById("content");
    let qrScannerInstance = null;

    const dashboard = {
        render(section) {
            const sections = {
                home: `
                    <div class="divc sec1">
                        <div class="adress"><span id="adress"></span>🧷</div>
                        <div class="buttons">
                            <button onclick="openSendDocumentPopup()"><i class="fa-solid fa-arrow-up"></i>إرسال</button>
                            <button id="requestDocsBtn"><i class="fa-solid fa-arrow-down"></i> طلب وثائق</button>
                        </div>
                    </div>
                    <div class="divc">
                        <h3>العمليات الأخيرة</h3>
                        <div class="transactions">
                            ${Array.from({length: 10}, (_,i) => `
                            <div class="operation ${i%2 ? 'send' : 'recieve'}">
                                <i class="fa-solid fa-turn-${i%2 ? 'up' : 'down'}"></i>
                                ${i%2 ? 'إرسال' : 'استلام'}
                            </div>
                            `).join('')}
                        </div>
                    </div>
                `,
                documents: `
                    <h3>الوثائق</h3>
                    <div class="documents-list">
                        ${['شهادة ميلاد', 'شهادة إقامة', 'تصريح شرفي'].map(doc => `
                            <div class="document-item">${doc}</div>
                        `).join('')}
                    </div>
                `,
                trackdocuments: `<h3>تتبع الوثائق</h3>`,
                settings: `<h3>الإعدادات</h3>`
            };

            content.innerHTML = sections[section] || `<p>القسم غير موجود</p>`;
            
            if(section === 'home') this.initializeHome();
            if(section === 'documents') this.initializeDocuments();
        },

        initializeHome() {
            const addressElement = document.getElementById('adress');
            const citizenId = localStorage.getItem('userId');
            
            // جلب بيانات المحفظة
            fetch(`http://localhost:5000/api/auth/citizens/${citizenId}`)
                .then(res => res.json())
                .then(data => {
                    addressElement.textContent = data.walletAddress;
                    window.adre = data.walletAddress;
                })
                .catch(error => console.error('Error fetching wallet:', error));

            // إعداد النوافذ المنبثقة
            document.getElementById('adress').addEventListener('click', showQRCodeAndCopy);
            document.getElementById('requestDocsBtn').addEventListener('click', openRequestPopup);
            document.getElementById('closeSendDocumentPopup').addEventListener('click', closeSendDocumentPopup);
            document.getElementById('scanQrCodeBtn').addEventListener('click', scanRecipientQRCode);
            document.getElementById('confirmSendDocumentBtn').addEventListener('click', sendSelectedDocument);
        },

        initializeDocuments() {
            console.log('تهيئة قسم الوثائق...');
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            dashboard.render(e.target.dataset.section);
        });
    });

    dashboard.render('home');
});

// ----------------- الدوال المساعدة -----------------
function showQRCodeAndCopy() {
    const popup = document.getElementById('popup');
    const qrCodeContainer = document.getElementById('qrCodeContainer');
    
    new QRCode(qrCodeContainer, {
        text: window.adre,
        width: 200,
        height: 200
    });

    popup.style.display = 'flex';
    document.getElementById('popup-address').textContent = window.adre;
    
    document.querySelector('#popup .close-btn').addEventListener('click', () => {
        popup.style.display = 'none';
        qrCodeContainer.innerHTML = '';
    });
}

function openSendDocumentPopup() {
    document.getElementById('sendDocumentPopup').style.display = 'flex';
    loadUserDocuments();
}

function closeSendDocumentPopup() {
    document.getElementById('sendDocumentPopup').style.display = 'none';
}

function loadUserDocuments() {
    const select = document.getElementById('selectDocumentToSend');
    select.innerHTML = '<option value="">اختر وثيقة</option>';
    ['شهادة ميلاد', 'شهادة إقامة', 'تصريح شرفي'].forEach(doc => {
        select.innerHTML += `<option value="${doc}">${doc}</option>`;
    });
}

async function openQrScanner() {
    try {
        // إيقاف أي ماسح نشط مسبقًا
        if (qrScannerInstance && qrScannerInstance.isScanning) {
            await qrScannerInstance.stop();
        }
        
        const qrScannerPopup = document.getElementById('qrScannerPopup');
        qrScannerPopup.style.display = 'flex';
        
        qrScannerInstance = new Html5Qrcode('qrScanner');
        const cameras = await Html5Qrcode.getCameras();
        
        if (cameras.length > 0) {
            await qrScannerInstance.start(
                cameras[0].id,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                decodedText => {
                    document.getElementById('recipientWalletAddress').value = decodedText;
                    closeQrScannerPopup();
                },
                error => {
                    if (error) console.log('QR Scanner error:', error);
                    closeQrScannerPopup();
                }
            );
        }
    } catch (error) {
        console.error('Scanner error:', error);
        alert(`خطأ في الماسح: ${error.message}`);
        closeQrScannerPopup();
    }
}

async function closeQrScannerPopup() {
    try {
        if (qrScannerInstance && qrScannerInstance.isScanning) {
            await qrScannerInstance.stop();
        }
        qrScannerInstance = null;
        document.getElementById('qrScannerPopup').style.display = 'none';
        document.getElementById('qrScanner').innerHTML = '';
    } catch (err) {
        console.error('Error stopping scanner:', err);
    }
}

function scanRecipientQRCode() {
    if(confirm('السماح باستخدام الكاميرا لمسح رمز QR؟')) {
        openQrScanner().catch(error => {
            console.error('فشل تشغيل الماسح:', error);
            alert('تعذر فتح الماسح: ' + error.message);
        });
    }
}

function sendSelectedDocument(e) {
    e.preventDefault();
    const address = document.getElementById('recipientWalletAddress').value;
    const doc = document.getElementById('selectDocumentToSend').value;
    
    if(!address || !doc) {
        alert('يرجى تعبئة جميع الحقول');
        return;
    }
    
    alert(`تم إرسال ${doc} إلى ${address}`);
    closeSendDocumentPopup();
}

function openRequestPopup() {
    document.getElementById('requestPopup').style.display = 'flex';
    
    document.querySelector('#requestPopup .close-btn').addEventListener('click', () => {
        document.getElementById('requestPopup').style.display = 'none';
    });
}

// أحداث الإغلاق العامة
document.getElementById('closeQrScanner').addEventListener('click', closeQrScannerPopup);
