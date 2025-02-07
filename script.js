document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("[data-section]")
  const content = document.getElementById("content")

  const dashboard = {
    render(section) {
      const sections = {
        home: `
          <div class="divc sec1">
            <div class="adress"><span id="adress" onclick="showQRCodeAndCopy();"></span>🧷</div>
            <!-- نافذة منبثقة (Popup) -->
            <div id="popup" class="popup">
              <div class="popup-content">
                <span class="close-btn">&times;</span>
                <div id="qrCodeContainer"></div>
                <p id="popup-address"></p>
                <button id="copyBtn">Copy🧷</button>
              </div>
            </div>
            <div class="buttons ">
              <button onclick="openSendDocumentPopup()"><i class="fa-solid fa-arrow-up"></i>إرسال</button>
              <!-- نافذة الإرسال مخفية -->
              <div id="sendDocumentPopup" class="popup-window">
                <div class="popup-content">
                  <span class="close-popup-btn" id="closeSendDocumentPopup">&times;</span>
                  <!-- إدخال عنوان المحفظة -->
                  <label> Send to :</label>
                  <div class="input-container">
                    <input type="text" id="recipientWalletAddress" placeholder="Wallet Adress  ">
                    <button id="scanQrCodeBtn"><i class="fa-solid fa-qrcode"></i></button>
                  </div>
                  <!-- اختيار الوثيقة -->
                  <label> Choose :</label>
                  <select id="selectDocumentToSend">
                    <!-- سيتم ملء الوثائق ديناميكيًا -->
                  </select>
                  <!-- زر إرسال -->
                  <button id="confirmSendDocumentBtn">إرسال</button>
                </div>
              </div>
              <button id="requestDocsBtn" onclick="openRequestPopup();"><i class="fa-solid fa-arrow-down"></i> طلب وثائق</button>
              <!-- النافذة المنبثقة لاختيار نوع الوثيقة -->
              <div id="requestPopup" style="display: none;">
                <div id="popup-content">
                  <select id="documentType">
                    <option value="birthCertificate">شهادة ميلاد</option>
                    <option value="residenceCertificate">شهادة إقامة</option>
                    <option value="honorStatement">تصريح شرفي</option>
                    <option value="workCertificate">شهادة عمل</option>
                  </select>
                  <button id="submitRequest">Send</button>
                  <button class="close-btn">Cancel</button>
                </div>
              </div>
            </div>
          </div>
          <div class="divc">
            <div class="title1"><h3>Transactions</h3></div>
            <div class="transactions">
              <div class="operation recieve"><i class="fa-solid fa-turn-down"></i>  recieve </div>
              <div class="operation send"><i class="fa-solid fa-turn-up"></i>  send  </div>
              <div class="operation send"><i class="fa-solid fa-turn-up"></i>  send </div>
              <div class="operation recieve"><i class="fa-solid fa-turn-down"></i>  recieve </div>
              <div class="operation send"><i class="fa-solid fa-turn-up"></i> send </div>
              <div class="operation recieve"><i class="fa-solid fa-turn-down"></i>  recieve </div>
              <div class="operation send"><i class="fa-solid fa-turn-up"></i>  send </div>
              <div class="operation recieve"><i class="fa-solid fa-turn-down"></i>  recieve </div>
              <div class="operation send"><i class="fa-solid fa-turn-up"></i>  send </div>
              <div class="operation recieve"><i class="fa-solid fa-turn-down"></i>  recieve </div>
              <div class="operation recieve"><i class="fa-solid fa-turn-down"></i>  recieve </div>
            </div>
          </div>
        `,
        documents: `
          <h3 class="text-2xl font-bold mb-4">الوثائق</h3>
          <div class="documents-list">
          </div>
        `,
        trackdocuments: `
          <h3 class="text-2xl font-bold mb-4">تتبع الوثائق</h3>
          <div class="tracking-section">
            <!-- Add document tracking content here -->
          </div>
        `,
        settings: `
          <h3 class="text-2xl font-bold mb-4">الإعدادات</h3>
          <div class="settings-form">
            <!-- Add settings form here -->
          </div>
        `,
      }

      if (sections[section]) {
        content.innerHTML = sections[section]
        if (section === "home") {
          // Logic for home section
          this.initializeHome()
        } else if (section === "documents") {
          // Logic for documents section
          this.initializeDocuments()
        } else if (section === "trackdocuments") {
          // Logic for trackdocuments section
          this.initializeTrackDocuments()
        } else if (section === "settings") {
          // Logic for settings section
          this.initializeSettings()
        }
      } else {
        content.innerHTML = `<p>القسم غير موجود</p>`
      }
    },

    initializeHome() {
      const addressContainer = document.querySelector("#adress")
      const citizenId = localStorage.getItem("userId")

      async function fetchCitizenData() {
        try {
          if (!citizenId) {
            console.error("لا يوجد ID للمواطن في LocalStorage")
            return
          }

          const response = await fetch(`http://localhost:5000/api/auth/citizens/${citizenId}`)
          const data = await response.json()

          if (response.ok) {
            addressContainer.textContent = data.walletAddress
            window.adre = addressContainer.textContent
          } else {
            console.error("خطأ في جلب بيانات المواطن", data.message)
          }
        } catch (error) {
          console.error("حدث خطأ أثناء جلب بيانات المواطن", error)
        }
      }

      fetchCitizenData()

      // Set up event listeners and initialize other components
      setupRequestDocsButton()
      document.getElementById("closeSendDocumentPopup").addEventListener("click", closeSendDocumentPopup)
      document.getElementById("scanQrCodeBtn").addEventListener("click", scanRecipientQRCode)
      document.getElementById("confirmSendDocumentBtn").addEventListener("click", sendSelectedDocument)

      // Add this line
      if (document.getElementById("closeQrScanner")) {
        document.getElementById("closeQrScanner").addEventListener("click", closeQrScannerPopup)
      }
    },
    initializeDocuments() {
      console.log("Initializing documents section")
      // Add your documents section specific logic here
    },

    initializeTrackDocuments() {
      console.log("Initializing track documents section")
      // Add your track documents section specific logic here
    },

    initializeSettings() {
      console.log("Initializing settings section")
      // Add your settings section specific logic here
    },
    sendDocument(id) {
      alert(`تم إرسال الوثيقة ${id}`)
    },


  }

  // Add event listeners to navigation links
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault()
      const section = e.target.closest("[data-section]").dataset.section
      dashboard.render(section)
    })
  })

  // Initial render
  dashboard.render("home")
})

// دالة لعرض QR Code ونسخ العنوان
function showQRCodeAndCopy() {
  const popup = document.querySelector("#popup")
  const popupAddress = document.querySelector("#popup-address")
  const qrCodeContainer = document.querySelector("#qrCodeContainer")
  const copyBtn = document.querySelector("#copyBtn")
  const closeBtn = document.querySelector(".close-btn")

  popup.style.display = "block"
  popupAddress.textContent = window.adre

  // Import QRCode library (assuming you have it included in your HTML)
  //The QRCode variable was undeclared.  Assuming you are using a library like qrcode.js
  new QRCode(qrCodeContainer, {
    text: window.adre,
    width: 128,
    height: 128,
  })

  copyBtn.addEventListener("click", () => {
    const range = document.createRange()
    range.selectNode(popupAddress)
    window.getSelection().removeAllRanges()
    window.getSelection().addRange(range)
    document.execCommand("copy")
    alert("تم نسخ العنوان إلى الحافظة!")
  })

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none"
    qrCodeContainer.innerHTML = ""
  })
}

function setupRequestDocsButton() {
  const requestDocsBtn = document.querySelector("#requestDocsBtn")
  requestDocsBtn.addEventListener("click", openRequestPopup)
}

function openRequestPopup() {
  const requestPopup = document.querySelector("#requestPopup")
  const closeBtn = requestPopup.querySelector(".close-btn")
  const submitRequestBtn = requestPopup.querySelector("#submitRequest")

  requestPopup.style.display = "block"

  closeBtn.addEventListener("click", hidePopup)

  requestPopup.addEventListener("click", (e) => {
    if (e.target === requestPopup) hidePopup()
  })

  submitRequestBtn.removeEventListener("click", handleSubmitRequest)
  submitRequestBtn.addEventListener("click", handleSubmitRequest, { once: true })
}

function hidePopup() {
  document.querySelector("#requestPopup").style.display = "none"
}

function handleSubmitRequest() {
  const requestType = document.querySelector("#documentType").value
  submitRequest(requestType)
  hidePopup()
}

async function submitRequest(requestType) {
  const token = localStorage.getItem("token")

  if (!token) {
    alert("يرجى تسجيل الدخول أولاً")
    return
  }

  try {
    const response = await fetch("http://localhost:5000/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ requestType }),
    })

    const data = await response.json()

    if (response.ok) {
      alert("تم إرسال الطلب بنجاح!")
    } else {
      alert("حدث خطأ أثناء إرسال الطلب: " + data.message)
    }
  } catch (error) {
    console.error("خطأ في إرسال الطلب:", error)
    alert("حدث خطأ أثناء إرسال الطلب")
  }
}

function openSendDocumentPopup() {
  const popup = document.getElementById("sendDocumentPopup")
  popup.style.display = "block"
  loadUserDocuments()
}

function closeSendDocumentPopup() {
  document.getElementById("sendDocumentPopup").style.display = "none"
}

function loadUserDocuments() {
  const documentSelect = document.getElementById("selectDocumentToSend")
  documentSelect.innerHTML = '<option value="">Documents </option>'
  const userDocuments = ["شهادة ميلاد", "شهادة إقامة", "تصريح شرفي", "شهادة عمل"]
  userDocuments.forEach((doc) => {
    const option = document.createElement("option")
    option.value = doc
    option.textContent = doc
    documentSelect.appendChild(option)
  })
}

async function requestCameraPermission() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter((device) => device.kind === "videoinput")

    if (videoDevices.length === 0) {
      throw new Error("No camera found on this device.")
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
      },
    })
    stream.getTracks().forEach((track) => track.stop())
    return true
  } catch (error) {
    console.error("Camera permission error:", error)
    const permissionInstructions = document.getElementById("cameraPermissionInstructions")
    if (permissionInstructions) {
      permissionInstructions.style.display = "block"
    }
    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      alert("تم رفض إذن الكاميرا. يرجى تمكين الكاميرا واتباع التعليمات الموضحة.")
    } else {
      alert(
        `حدث خطأ أثناء الوصول إلى الكاميرا: ${error.message}\nيرجى التأكد من أن جهازك يدعم الوصول إلى الكاميرا وأنها غير مستخدمة من قبل تطبيق آخر.`,
      )
    }
    return false
  }
}
async function closeQrScannerPopup() {
  const qrScannerPopup = document.getElementById("qrScannerPopup");
  if (qrScannerPopup) {
    qrScannerPopup.style.display = "none";
  }

  try {
    if (qrScanner && qrScanner.isScanning) {
      await qrScanner.stop();
      qrScanner.clear();
      console.log("تم إيقاف الماسح بنجاح");
    }
  } catch (err) {
    console.error("خطأ أثناء إيقاف الماسح:", err);
  }
}

async function openQrScanner() {
  const qrScannerPopup = document.getElementById("qrScannerPopup")
  if (!qrScannerPopup) {
    console.error("QR Scanner popup element not found")
    return
  }

  qrScannerPopup.style.display = "block"
  const scannerElement = document.getElementById("qrScanner")
  if (scannerElement) {
    scannerElement.innerHTML = "<p>جاري تحميل الكاميرا...</p>"
  }

  try {
    const hasPermission = await requestCameraPermission()
    if (!hasPermission) {
      return
    }

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    }

    const qrScanner = new Html5Qrcode("qrScanner")

    const cameras = await Html5Qrcode.getCameras()
    if (cameras && cameras.length) {
      const cameraId = cameras[cameras.length - 1].id // Use the last camera (usually back camera on mobile)

      await qrScanner.start(
        cameraId,
        config,
        (decodedText) => {
          const walletAddressInput = document.getElementById("recipientWalletAddress")
          if (walletAddressInput) {
            walletAddressInput.value = decodedText

            closeQrScannerPopup()
          } else {
            console.error("Wallet address input not found")
          }
        },
        (errorMessage) => {
          // Ignore errors during scanning
          console.log(errorMessage)
        },
      )
    } else {
      throw new Error("No cameras found on the device.")
    }
  } catch (error) {
    console.error("Scanner error:", error)
    alert(
      `حدث خطأ في تشغيل الماسح الضوئي: ${error.message}\nيرجى التأكد من أن جهازك يدعم مسح QR وأن الكاميرا غير مستخدمة من قبل تطبيق آخر.`,
    )
    closeQrScannerPopup()
  }
}

// Update the scanRecipientQRCode function to show a message first
function scanRecipientQRCode() {
  const message = `
    سنحتاج إلى استخدام كاميرا هاتفك لمسح رمز QR.
    يرجى السماح بالوصول إلى الكاميرا عند ظهور الطلب.
    إذا لم يظهر طلب الإذن، يرجى التحقق من إعدادات الكاميرا في متصفحك.
  `

  if (confirm(message)) {
    openQrScanner()
  }
}

function sendSelectedDocument(event) {
  event.preventDefault();

  // الحصول على عنصر الإدخال مباشرة
  const addressInput = document.getElementById("recipientWalletAddress");
  const selectedDoc = document.getElementById("selectDocumentToSend").value;

  if (!addressInput.value || !selectedDoc) {
    alert("يرجى إدخال عنوان المحفظة واختيار وثيقة!");
    return;
  }

  alert(`تم إرسال "${selectedDoc}" إلى العنوان: ${addressInput.value}`);

  // تفريغ حقل العنوان مباشرة
  addressInput.value = "";

  closeSendDocumentPopup();
}

const qrScannerPopup = document.getElementById("qrScannerPopup")
const scanQrCodeBtn = document.getElementById("scanQrCodeBtn")
const closeQrScanner = document.getElementById("closeQrScanner")
const walletAddressInput = document.getElementById("recipientWalletAddress")

let qrScanner // Global variable for QR scanner


// Add event listener for closing QR scanner
const closeQrScanner1 = document.getElementById("closeQrScanner")
if (closeQrScanner) {
  closeQrScanner.addEventListener("click", closeQrScannerPopup)
}

