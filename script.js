// Global variables
let currentTab = 0;
let items = [];
let invoiceData = {
    userName: '',
    vendorName: '',
    invoiceDate: '',
    invoiceNumber: '',
    businessAddress: '',
    vendorAddress: '',
    contactNumber: '',
    gstNumber: '',
    upiId: '',
    discountType: 'none',
    discountValue: 0,
    signature: null,
    template: 'modern',
    paymentMethod: '',
    authorizedSignatory: ''
};

// ==================== NEW PAYMENT SYSTEM VARIABLES ====================
let paymentData = {
    currentMode: '',
    dailyTotals: {
        cash: 0,
        upi: 0, 
        card: 0,
        udhaar: 0,
        credit: 0
    },
    customers: [],
    lastSaved: null,
    autoSave: true
};








// Text-to-Speech Setup - FIXED VERSION
let speechSynthesis = window.speechSynthesis;
let isSpeaking = false;

// Speak text function - COMPLETELY FIXED
function speakText(text) {
    if (!speechSynthesis) {
        console.log("Text-to-speech not supported in this browser.");
        return;
    }
    
    // Pehle stop karo any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;  // Speed thoda fast karo
    utterance.pitch = 1.0;
    utterance.volume = 1.0; // Volume full karo
    utterance.lang = 'hi-IN'; // Hindi set karo
    
    // Voice select karo with proper timing
    function speakWithVoice() {
        const voices = speechSynthesis.getVoices();
        console.log("Available voices:", voices);
        
        // Hindi voice dhoondo
        const hindiVoice = voices.find(voice => 
            voice.lang.includes('hi') || 
            voice.lang.includes('hi-IN') ||
            voice.name.includes('Hindi')
        );
        
        if (hindiVoice) {
            utterance.voice = hindiVoice;
            console.log("Using Hindi voice:", hindiVoice.name);
        } else {
            console.log("Hindi voice not found, using default");
        }
        
        utterance.onstart = function() {
            isSpeaking = true;
            console.log("Speaking started:", text);
        };
        
        utterance.onend = function() {
            isSpeaking = false;
            console.log("Speaking ended");
        };
        
        utterance.onerror = function(event) {
            console.error('Speech synthesis error:', event);
            isSpeaking = false;
        };
        
        // Speech start karo
        speechSynthesis.speak(utterance);
    }
    
    // Ensure voices are loaded
    if (speechSynthesis.getVoices().length > 0) {
        speakWithVoice();
    } else {
        speechSynthesis.onvoiceschanged = speakWithVoice;
    }
}

// Initialize Text-to-Speech
function initTextToSpeech() {
    console.log("Text-to-Speech system initialized");
    // Test voice system
    setTimeout(() => {
        speakText("Voice system ready");
    }, 1000);
}








// ==================== COMPLETE NEW VOICE RECOGNITION SYSTEM ====================

// Voice Recognition System - COMPLETELY FIXED
let recognition;
let isListening = false;
let currentVoiceType = '';
let currentLanguage = 'hi-IN';

// Initialize Voice Recognition
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = currentLanguage;
        
        recognition.onstart = function() {
            isListening = true;
            updateVoiceUI(true);
            document.getElementById('voiceStatus').textContent = "🎤 Listening... Bolna shuru karein!";
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            console.log("Voice Input:", transcript, "Type:", currentVoiceType);
            processVoiceCommand(transcript, currentVoiceType);
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            isListening = false;
            updateVoiceUI(false);
            
            if (event.error === 'not-allowed') {
                document.getElementById('voiceStatus').textContent = "❌ Microphone permission required!";
                showNotification('Microphone permission deni padegi voice use karne ke liye', 'error');
            } else {
                document.getElementById('voiceStatus').textContent = "❌ Voice recognition error. Try again!";
            }
        };

        recognition.onend = function() {
            isListening = false;
            updateVoiceUI(false);
            document.getElementById('voiceStatus').textContent = "Voice system ready! Koi bhi button dabake bolna shuru karein.";
        };
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Voice recognition not supported in your browser";
        showNotification('Aapka browser voice recognition support nahi karta', 'error');
    }
}

// Update Voice UI
function updateVoiceUI(listening) {
    const voiceBtn = document.getElementById('mainVoiceBtn');
    const voiceText = document.getElementById('mainVoiceText');
    
    if (listening) {
        voiceBtn.classList.add('listening');
        voiceText.innerHTML = '<i class="fas fa-microphone"></i> Listening... Bolna Band Kare';
        voiceBtn.style.background = 'linear-gradient(45deg, #ff0066, #ff00d6)';
    } else {
        voiceBtn.classList.remove('listening');
        voiceText.innerHTML = '<i class="fas fa-microphone"></i> SUNO - Voice Input Start Kare';
        voiceBtn.style.background = 'linear-gradient(45deg, var(--primary), var(--accent))';
    }
}

// Main Voice Input Toggle
function toggleMainVoiceInput() {
    if (!recognition) {
        showNotification('Voice recognition not available', 'error');
        return;
    }
    
    if (isListening) {
        recognition.stop();
    } else {
        currentVoiceType = 'general';
        recognition.lang = currentLanguage;
        recognition.start();
    }
}

// Specific Voice Input - FIXED
function startVoiceInput(type) {
    if (!recognition) {
        showNotification('Voice recognition not available', 'error');
        return;
    }
    
    if (isListening) {
        recognition.stop();
        return;
    }
    
    currentVoiceType = type;
    recognition.lang = currentLanguage;
    recognition.start();
    
    // Show what to speak based on type
    const prompts = {
        'business': "Business name bolein jaise: 'Business name Sharma Traders'",
        'address': "Business address bolein jaise: 'Business address Delhi Model Town'",
        'contact': "Contact number bolein jaise: 'Contact number 9876543210'",
        'gst': "GST number bolein jaise: 'GST number 07ABCDE1234F1Z5'",
        'customer': "Customer name bolein jaise: 'Customer name Rajesh Kumar'",
        'customer-address': "Customer address bolein jaise: 'Customer address Mumbai Andheri'",
        'invoice-number': "Invoice number bolein jaise: 'Invoice number INV-8603'",
        'invoice-date': "Invoice date bolein jaise: 'Invoice date 25 December 2024'",
        'item': "Item name bolein jaise: 'Item Laptop', 'Product Mobile Phone'",
        'quantity': "Quantity bolein jaise: 'Quantity 5', 'Quantity 10 pieces'",
        'price': "Price bolein jaise: 'Price 5000', 'Price fifty thousand'",
        'discount': "Discount bolein jaise: 'Discount 10 percent', 'Discount 500 rupees'",
        'upi': "UPI ID bolein jaise: 'UPI ID ravi@okicici'"
    };
    
    document.getElementById('voiceStatus').textContent = `🎤 ${prompts[type] || 'Bolna shuru karein...'}`;
}

// Process Voice Commands - COMPLETELY REVISED AND FIXED
function processVoiceCommand(transcript, type) {
    console.log("Processing:", transcript, "Type:", type);
    
    const lowerTranscript = transcript.toLowerCase();
    showNotification(`"${transcript}"`, 'info');
    
    // Handle specific field types first
    switch(type) {
        case 'business':
            processBusinessName(transcript);
            break;
        case 'address':
            processBusinessAddress(transcript);
            break;
        case 'contact':
            processContactNumber(transcript);
            break;
        case 'gst':
            processGSTNumber(transcript);
            break;
        case 'customer':
            processCustomerName(transcript);
            break;
        case 'customer-address':
            processCustomerAddress(transcript);
            break;
        case 'invoice-number':
            processInvoiceNumber(transcript);
            break;
        case 'invoice-date':
            processInvoiceDate(transcript);
            break;

            case 'item':
    processItemName(transcript);
    break;
        case 'quantity':
            processQuantity(transcript);
            break;
        case 'price':
            processPrice(transcript);
            break;
            case 'item-description':
               processItemDescription(transcript);
             break;

        case 'discount':
            processDiscount(transcript);
            break;
        case 'upi':
            processUPI(transcript);
            break;
        default:
            // For general/main voice input
            processGeneralVoiceCommand(transcript);
    }
    
    updateInvoicePreview();
}

// Individual field processors - FIXED
function processBusinessName(transcript) {
    let businessName = transcript.replace(/business name/gi, '')
                                .replace(/business/gi, '')
                                .replace(/name/gi, '')
                                .replace(/व्यवसाय/gi, '')
                                .replace(/नाम/gi, '')
                                .trim();
    
    if (businessName && businessName.length > 1) {
        document.getElementById('userName').value = businessName;
        document.getElementById('voiceStatus').textContent = `✅ Business name set: ${businessName}`;
        speakText(`Business name set ${businessName}`);
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak business name clearly";
    }
}

function processBusinessAddress(transcript) {
    let address = transcript.replace(/business address/gi, '')
                           .replace(/address/gi, '')
                           .replace(/व्यवसाय/gi, '')
                           .replace(/पता/gi, '')
                           .trim();
    
    if (address && address.length > 5) {
        document.getElementById('businessAddress').value = address;
        document.getElementById('voiceStatus').textContent = `✅ Business address set`;
        speakText('Business address set');
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak address clearly";
    }
}

function processContactNumber(transcript) {
    // Extract numbers from transcript
    const numbers = transcript.replace(/\D/g, '');
    if (numbers.length >= 10) {
        document.getElementById('contactNumber').value = numbers.substring(0, 10);
        document.getElementById('voiceStatus').textContent = `✅ Contact number set: ${numbers.substring(0, 10)}`;
        speakText('Contact number set');
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak 10-digit phone number";
    }
}

function processGSTNumber(transcript) {
    let gstNumber = transcript.replace(/gst number/gi, '')
                             .replace(/gst/gi, '')
                             .replace(/number/gi, '')
                             .replace(/जीएसटी/gi, '')
                             .replace(/नंबर/gi, '')
                             .trim()
                             .toUpperCase();
    
    if (gstNumber && gstNumber.length > 5) {
        document.getElementById('gstNumber').value = gstNumber;
        document.getElementById('voiceStatus').textContent = `✅ GST number set: ${gstNumber}`;
        speakText('GST number set');
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak GST number clearly";
    }
}

function processCustomerName(transcript) {
    let customerName = transcript.replace(/customer name/gi, '')
                                .replace(/customer/gi, '')
                                .replace(/name/gi, '')
                                .replace(/ग्राहक/gi, '')
                                .replace(/नाम/gi, '')
                                .trim();
    
    if (customerName && customerName.length > 1) {
        document.getElementById('vendorName').value = customerName;
        document.getElementById('voiceStatus').textContent = `✅ Customer name set: ${customerName}`;
        speakText(`Customer name set ${customerName}`);
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak customer name clearly";
    }
}

function processCustomerAddress(transcript) {
    let address = transcript.replace(/customer address/gi, '')
                           .replace(/address/gi, '')
                           .replace(/ग्राहक/gi, '')
                           .replace(/पता/gi, '')
                           .trim();
    
    if (address && address.length > 5) {
        document.getElementById('vendorAddress').value = address;
        document.getElementById('voiceStatus').textContent = `✅ Customer address set`;
        speakText('Customer address set');
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak address clearly";
    }
}

function processInvoiceNumber(transcript) {
    let invoiceNumber = transcript.replace(/invoice number/gi, '')
                                 .replace(/invoice/gi, '')
                                 .replace(/number/gi, '')
                                 .replace(/इनवॉइस/gi, '')
                                 .replace(/नंबर/gi, '')
                                 .trim()
                                 .toUpperCase();
    
    if (invoiceNumber) {
        document.getElementById('invoiceNumber').value = invoiceNumber;
        document.getElementById('voiceStatus').textContent = `✅ Invoice number set: ${invoiceNumber}`;
        speakText('Invoice number set');
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak invoice number clearly";
    }
}

function processInvoiceDate(transcript) {
    // Simple date extraction - in real app you'd use more sophisticated parsing
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = dateStr;
    document.getElementById('voiceStatus').textContent = `✅ Invoice date set to today`;
    speakText('Invoice date set to today');
}

// QUANTITY PROCESSOR - FIXED
function processQuantity(transcript) {
    const quantity = extractNumberFromText(transcript);
    if (quantity && quantity > 0) {
        setLastItemQuantity(quantity);
        document.getElementById('voiceStatus').textContent = `✅ Quantity set: ${quantity}`;
        speakText(`Quantity set ${quantity}`);
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak quantity clearly, like 'Quantity 5'";
    }
}

// Set quantity for last item - FIXED
function setLastItemQuantity(quantity) {
    const itemRows = document.querySelectorAll('.item-row');
    if (itemRows.length > 0) {
        const lastItem = itemRows[itemRows.length - 1];
        lastItem.querySelector('.item-qty').value = quantity;
        // Also trigger input event to update calculations
        lastItem.querySelector('.item-qty').dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        // If no items, add one first
        addItemRow();
        setLastItemQuantity(quantity);
    }
}

function processPrice(transcript) {
    const price = extractNumberFromText(transcript);
    if (price && price > 0) {
        setLastItemPrice(price);
        document.getElementById('voiceStatus').textContent = `✅ Price set: ₹${price}`;
        speakText(`Price set ${price}`);
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak price clearly, like 'Price 5000'";
    }
}

// Set price for last item - FIXED
function setLastItemPrice(price) {
    const itemRows = document.querySelectorAll('.item-row');
    if (itemRows.length > 0) {
        const lastItem = itemRows[itemRows.length - 1];
        lastItem.querySelector('.item-price').value = price;
        // Also trigger input event to update calculations
        lastItem.querySelector('.item-price').dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        // If no items, add one first
        addItemRow();
        setLastItemPrice(price);
    }
}

function processDiscount(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    const discountValue = extractNumberFromText(transcript);
    
    if (discountValue && discountValue > 0) {
        if (lowerTranscript.includes('percent') || lowerTranscript.includes('प्रतिशत') || lowerTranscript.includes('%')) {
            document.getElementById('discountType').value = 'percentage';
            document.getElementById('discountValue').value = discountValue;
            document.getElementById('voiceStatus').textContent = `✅ Discount set: ${discountValue}%`;
            speakText(`Discount set ${discountValue} percent`);
        } else {
            document.getElementById('discountType').value = 'fixed';
            document.getElementById('discountValue').value = discountValue;
            document.getElementById('voiceStatus').textContent = `✅ Discount set: ₹${discountValue}`;
            speakText(`Discount set ${discountValue} rupees`);
        }
        // Trigger change event to update calculations
        document.getElementById('discountValue').dispatchEvent(new Event('input', { bubbles: true }));
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak discount clearly, like 'Discount 10 percent' or 'Discount 500 rupees'";
    }
}

function processUPI(transcript) {
    let upiId = transcript.replace(/upi id/gi, '')
                         .replace(/upi/gi, '')
                         .replace(/id/gi, '')
                         .replace(/यूपीआई/gi, '')
                         .replace(/आईडी/gi, '')
                         .trim();


    // Basic UPI validation
    if (upiId.includes('@') && upiId.length > 5) {
        document.getElementById('upiId').value = upiId;
        document.getElementById('voiceStatus').textContent = `✅ UPI ID set: ${upiId}`;
        speakText('UPI ID set');
        updateQRCode();
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak valid UPI ID like 'ravi@okicici'";
    }
}




                         function processItemName(transcript) {
    let itemName = transcript
        .replace(/item/gi, '')
        .replace(/product/gi, '')
        .replace(/name/gi, '')
        .replace(/आइटम/gi, '')
        .replace(/प्रोडक्ट/gi, '')
        .replace(/नाम/gi, '')
        .trim();
    
    if (itemName && itemName.length > 1) {
        setLastItemName(itemName);
        document.getElementById('voiceStatus').textContent = `✅ Item set: ${itemName}`;
        speakText(`Item set ${itemName}`);
    }
    else {
        // ✅ YE ELSE CASE ADD KARO
        document.getElementById('voiceStatus').textContent = "❌ Please speak item name clearly, like 'Item Laptop' or 'Product Mobile'";
    }
}

function setLastItemName(itemName) {
    console.log("🔄 Setting item:", itemName);
    
    // Always add new row
    addItemRow();
    
    // Wait and then set the name
    setTimeout(() => {
        const rows = document.querySelectorAll('.item-row');
        const lastRow = rows[rows.length - 1];
        const nameInput = lastRow.querySelector('.item-desc');
        
        if (nameInput) {
            nameInput.value = itemName;
            console.log("✅ Item set in row:", itemName);
            updateInvoicePreview();
        }
    }, 300);
}
    





// General voice command processor - COMPLETELY FIXED
function processGeneralVoiceCommand(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    console.log("Processing general command:", transcript);



   // SMART ITEM PARSER - Pehle check karo
   // ✅ SMART ITEM PARSER - Pehle check karo
let numbers = transcript.match(/\d+/g);
if (numbers && numbers.length >= 2) {
    let smartResult = parseSmartItemCommand(transcript);
    if (smartResult.success) {
        console.log("🎯 Smart item detected!");
        addItemRow();
        setTimeout(() => {
            const rows = document.querySelectorAll('.item-row');
            const lastRow = rows[rows.length - 1];
            lastRow.querySelector('.item-desc').value = smartResult.name;
            lastRow.querySelector('.item-qty').value = smartResult.quantity;
            lastRow.querySelector('.item-price').value = smartResult.price;
            updateInvoicePreview();
            document.getElementById('voiceStatus').textContent = `✅ Smart item: ${smartResult.name}`;
        }, 500);
        return;
    }
}






    



    
    // Business Name Commands
    if (lowerTranscript.includes('business name') || lowerTranscript.includes('व्यवसाय नाम') || lowerTranscript.includes('shop name') || lowerTranscript.includes('दुकान नाम')) {
        let businessName = transcript.replace(/business name/gi, '')
                                    .replace(/shop name/gi, '')
                                    .replace(/व्यवसाय नाम/gi, '')
                                    .replace(/दुकान नाम/gi, '')
                                    .trim();
        if (businessName && businessName.length > 1) {
            document.getElementById('userName').value = businessName;
            document.getElementById('voiceStatus').textContent = `✅ Business name set: ${businessName}`;
            speakText(`Business name set ${businessName}`);
        }
        return;
    }
    
    // Business Address Commands
    if (lowerTranscript.includes('business address') || lowerTranscript.includes('व्यवसाय पता') || lowerTranscript.includes('shop address') || lowerTranscript.includes('दुकान पता')) {
        let address = transcript.replace(/business address/gi, '')
                               .replace(/shop address/gi, '')
                               .replace(/व्यवसाय पता/gi, '')
                               .replace(/दुकान पता/gi, '')
                               .trim();
        if (address && address.length > 5) {
            document.getElementById('businessAddress').value = address;
            document.getElementById('voiceStatus').textContent = `✅ Business address set`;
            speakText('Business address set');
        }
        return;
    }
    
    // Contact Number Commands
    if (lowerTranscript.includes('contact number') || lowerTranscript.includes('संपर्क नंबर') || lowerTranscript.includes('phone number') || lowerTranscript.includes('फोन नंबर')) {
        const numbers = transcript.replace(/\D/g, '');
        if (numbers.length >= 10) {
            document.getElementById('contactNumber').value = numbers.substring(0, 10);
            document.getElementById('voiceStatus').textContent = `✅ Contact number set: ${numbers.substring(0, 10)}`;
            speakText('Contact number set');
        }
        return;
    }
    
    // GST Number Commands
    if (lowerTranscript.includes('gst number') || lowerTranscript.includes('जीएसटी नंबर') || lowerTranscript.includes('gst')) {
        let gstNumber = transcript.replace(/gst number/gi, '')
                                 .replace(/gst/gi, '')
                                 .replace(/जीएसटी नंबर/gi, '')
                                 .trim()
                                 .toUpperCase();
        if (gstNumber && gstNumber.length > 5) {
            document.getElementById('gstNumber').value = gstNumber;
            document.getElementById('voiceStatus').textContent = `✅ GST number set: ${gstNumber}`;
            speakText('GST number set');
        }
        return;
    }
    
    // Customer Name Commands
    if (lowerTranscript.includes('customer name') || lowerTranscript.includes('ग्राहक नाम') || lowerTranscript.includes('client name') || lowerTranscript.includes('ग्राहक')) {
        let customerName = transcript.replace(/customer name/gi, '')
                                    .replace(/client name/gi, '')
                                    .replace(/ग्राहक नाम/gi, '')
                                    .trim();
        if (customerName && customerName.length > 1) {
            document.getElementById('vendorName').value = customerName;
            document.getElementById('voiceStatus').textContent = `✅ Customer name set: ${customerName}`;
            speakText(`Customer name set ${customerName}`);
        }
        return;
    }
    
    // Customer Address Commands
    if (lowerTranscript.includes('customer address') || lowerTranscript.includes('ग्राहक पता') || lowerTranscript.includes('client address')) {
        let address = transcript.replace(/customer address/gi, '')
                               .replace(/client address/gi, '')
                               .replace(/ग्राहक पता/gi, '')
                               .trim();
        if (address && address.length > 5) {
            document.getElementById('vendorAddress').value = address;
            document.getElementById('voiceStatus').textContent = `✅ Customer address set`;
            speakText('Customer address set');
        }
        return;
    }
    
    // Invoice Number Commands
    if (lowerTranscript.includes('invoice number') || lowerTranscript.includes('इनवॉइस नंबर') || lowerTranscript.includes('bill number')) {
        let invoiceNumber = transcript.replace(/invoice number/gi, '')
                                     .replace(/bill number/gi, '')
                                     .replace(/इनवॉइस नंबर/gi, '')
                                     .trim()
                                     .toUpperCase();
        if (invoiceNumber) {
            document.getElementById('invoiceNumber').value = invoiceNumber;
            document.getElementById('voiceStatus').textContent = `✅ Invoice number set: ${invoiceNumber}`;
            speakText('Invoice number set');
        }
        return;
    }
    
    // Invoice Date Commands
    if (lowerTranscript.includes('invoice date') || lowerTranscript.includes('इनवॉइस तारीख') || lowerTranscript.includes('bill date')) {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        document.getElementById('invoiceDate').value = dateStr;
        document.getElementById('voiceStatus').textContent = `✅ Invoice date set to today`;
        speakText('Invoice date set to today');
        return;
    }
    
    // QUANTITY Commands - ITEM/PRODUCT FIX
    if (lowerTranscript.includes('quantity') || lowerTranscript.includes('मात्रा') || lowerTranscript.includes('कितना') || lowerTranscript.includes('क्वांटिटी')) {
        const quantity = extractNumberFromText(transcript);
        if (quantity && quantity > 0) {
            setLastItemQuantity(quantity);
            document.getElementById('voiceStatus').textContent = `✅ Quantity set: ${quantity}`;
            speakText(`Quantity set ${quantity}`);
        } else {
            document.getElementById('voiceStatus').textContent = "❌ Please speak quantity clearly, like 'quantity 5'";
        }
        return;
    }
    
    // PRICE Commands - ITEM/PRODUCT FIX
    if (lowerTranscript.includes('price') || lowerTranscript.includes('कीमत') || lowerTranscript.includes('दाम') || lowerTranscript.includes('मूल्य')) {
        const price = extractNumberFromText(transcript);
        if (price && price > 0) {
            setLastItemPrice(price);
            document.getElementById('voiceStatus').textContent = `✅ Price set: ₹${price}`;
            speakText(`Price set ${price}`);
        } else {
            document.getElementById('voiceStatus').textContent = "❌ Please speak price clearly, like 'price 500'";
        }
        return;
    }
    
    // DISCOUNT Commands
    if (lowerTranscript.includes('discount') || lowerTranscript.includes('डिस्काउंट') || lowerTranscript.includes('छूट')) {
        const discountValue = extractNumberFromText(transcript);
        if (discountValue && discountValue > 0) {
            if (lowerTranscript.includes('percent') || lowerTranscript.includes('प्रतिशत') || lowerTranscript.includes('%')) {
                document.getElementById('discountType').value = 'percentage';
                document.getElementById('discountValue').value = discountValue;
                document.getElementById('voiceStatus').textContent = `✅ Discount set: ${discountValue}%`;
                speakText(`Discount set ${discountValue} percent`);
            } else {
                document.getElementById('discountType').value = 'fixed';
                document.getElementById('discountValue').value = discountValue;
                document.getElementById('voiceStatus').textContent = `✅ Discount set: ₹${discountValue}`;
                speakText(`Discount set ${discountValue} rupees`);
            }
            document.getElementById('discountValue').dispatchEvent(new Event('input', { bubbles: true }));
        }
        return;
    }
    
    // UPI ID Commands
    if (lowerTranscript.includes('upi') || lowerTranscript.includes('यूपीआई') || lowerTranscript.includes('upi id')) {
        let upiId = transcript.replace(/upi id/gi, '')
                             .replace(/upi/gi, '')
                             .replace(/यूपीआई/gi, '')
                             .trim();
        if (upiId.includes('@') && upiId.length > 5) {
            document.getElementById('upiId').value = upiId;
            document.getElementById('voiceStatus').textContent = `✅ UPI ID set: ${upiId}`;
            speakText('UPI ID set');
            updateQRCode();
        }
        return;
    }
    
    // GST ON/OFF Commands
    if (lowerTranscript.includes('gst on') || lowerTranscript.includes('gst चालू') || lowerTranscript.includes('जीएसटी ऑन')) {
        document.getElementById('gstToggle').checked = true;
        document.getElementById('gstStatus').textContent = 'ON';
        document.getElementById('gstModeText').textContent = 'ON (GST bills)';
        document.getElementById('voiceStatus').textContent = '✅ GST mode enabled';
        speakText('GST mode enabled');
        document.getElementById('gstToggle').dispatchEvent(new Event('change', { bubbles: true }));
        return;
    }
    
    if (lowerTranscript.includes('gst off') || lowerTranscript.includes('gst बंद') || lowerTranscript.includes('जीएसटी ऑफ')) {
        document.getElementById('gstToggle').checked = false;
        document.getElementById('gstStatus').textContent = 'OFF';
        document.getElementById('gstModeText').textContent = 'OFF (Simple bills)';
        document.getElementById('voiceStatus').textContent = '✅ GST mode disabled';
        speakText('GST mode disabled');
        document.getElementById('gstToggle').dispatchEvent(new Event('change', { bubbles: true }));
        return;
    }
    
    // Calculate Total
    if (lowerTranscript.includes('calculate') || lowerTranscript.includes('total') || lowerTranscript.includes('कुल') || lowerTranscript.includes('टोटल')) {
        calculateTotals();
        const total = document.getElementById('summary-total').textContent;
        document.getElementById('voiceStatus').textContent = `✅ Total calculated: ${total}`;
        speakText(`Total calculated ${total}`);
        return;
    }
    
    // Generate PDF
    if (lowerTranscript.includes('pdf') || lowerTranscript.includes('download') || lowerTranscript.includes('डाउनलोड')) {
        generatePDF();
        document.getElementById('voiceStatus').textContent = '✅ PDF generated successfully!';
        speakText('PDF generated successfully');
        return;
    }
    
    // Item/Product Name - Main voice se
if (lowerTranscript.startsWith('item ') || lowerTranscript.startsWith('product ') || lowerTranscript.startsWith('आइटम ') || lowerTranscript.startsWith('प्रोडक्ट ')) {
    
    console.log("🎯 Main voice item command:", transcript);
    
    let itemName = transcript;
    
    // "item " remove karo
    if (lowerTranscript.startsWith('item ')) {
        itemName = transcript.substring(5);
    }
    // "product " remove karo  
    else if (lowerTranscript.startsWith('product ')) {
        itemName = transcript.substring(8);
    }
    // "आइटम " remove karo
    else if (lowerTranscript.startsWith('आइटम ')) {
        itemName = transcript.substring(5);
    }
    // "प्रोडक्ट " remove karo
    else if (lowerTranscript.startsWith('प्रोडक्ट ')) {
        itemName = transcript.substring(8);
    }
    
    itemName = itemName.trim();
    console.log("🧹 Cleaned item name:", itemName);
    
    if (itemName && itemName.length > 1) {
        addItemRow();
        setTimeout(() => {
            const rows = document.querySelectorAll('.item-row');
            const lastRow = rows[rows.length - 1];
            const nameInput = lastRow.querySelector('.item-desc');
            if (nameInput) {
                nameInput.value = itemName;
                updateInvoicePreview();
                document.getElementById('voiceStatus').textContent = `✅ Item set: ${itemName}`;
                speakText(`Item set ${itemName}`);
            }
        }, 500);
    }
    return;
}
    
    // If no command matched
    document.getElementById('voiceStatus').textContent = "❌ Command not recognized. Try: 'Business Name', 'Quantity', 'Price', 'Discount', etc.";
    speakText("Command not recognized");
}

// Extract number from text - IMPROVED
function extractNumberFromText(text) {
    // Handle English numbers
    const englishMatch = text.match(/\d+/g);
    if (englishMatch) {
        return parseInt(englishMatch[0]);
    }
    
    // Handle Hindi numbers
    const hindiNumbers = {
        'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5,
        'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
        'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15,
        'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19, 'बीस': 20,
        'तीस': 30, 'चालीस': 40, 'पचास': 50, 'साठ': 60, 'सत्तर': 70,
        'अस्सी': 80, 'नब्बे': 90, 'सौ': 100, 'हज़ार': 1000, 'लाख': 100000,
        'पहला': 1, 'दूसरा': 2, 'तीसरा': 3, 'चौथा': 4, 'पांचवा': 5
    };
    
    const words = text.toLowerCase().split(' ');
    for (let word of words) {
        if (hindiNumbers[word]) {
            return hindiNumbers[word];
        }
    }
    
    return null;
}






// SMART ITEM PARSER - Kirana dukan ke liye
function parseSmartItemCommand(transcript) {
    console.log("🔍 Smart parsing:", transcript);
    
    // Numbers extract karo
    let numbers = transcript.match(/\d+/g);
    if (!numbers || numbers.length < 2) return { success: false };
    
    let quantity = parseInt(numbers[0]);
    let price = parseInt(numbers[numbers.length - 1]);
    
    // Units detect karo
    let unit = 'piece'; // default
    let priceUnit = 'piece'; // default
    
    if (/(gram|grams|gm)/gi.test(transcript)) {
        unit = 'gram';
    }
    if (/(kilo|kilogram|kg|kgs)/gi.test(transcript)) {
        unit = 'kilo';
    }
    if (/(dozen|darzan)/gi.test(transcript)) {
        unit = 'dozen';
    }
    if (/(metre|meter)/gi.test(transcript)) {
        unit = 'metre';
    }
    if (/(litre|liter)/gi.test(transcript)) {
        unit = 'litre';
    }
    
    // Price unit detect karo
    if (/(rupee dozen|rs dozen|per dozen)/gi.test(transcript)) {
        priceUnit = 'dozen';
    }
    if (/(rupee kilo|rs kilo|per kilo|rupee kg|rs kg|per kg)/gi.test(transcript)) {
        priceUnit = 'kilo';
    }
    if (/(rupee gram|rs gram|per gram|rupee gm|rs gm|per gm)/gi.test(transcript)) {
        priceUnit = 'gram';
    }
    if (/(rupee metre|rs metre|per metre|rupee meter|rs meter|per meter)/gi.test(transcript)) {
        priceUnit = 'metre';
    }
    if (/(rupee litre|rs litre|per litre|rupee liter|rs liter|per liter)/gi.test(transcript)) {
        priceUnit = 'litre';
    }
    
    // Smart calculation
    let finalPrice = price;
    
    // Unit conversion
    if (unit === 'gram' && priceUnit === 'kilo') {
        finalPrice = (quantity / 1000) * price;
    }
    else if (unit === 'gram' && priceUnit === 'gram') {
        finalPrice = quantity * price;
    }
    else if (unit === 'dozen' && priceUnit === 'dozen') {
        finalPrice = quantity * price;
    }
    else if (unit === 'piece' && priceUnit === 'dozen') {
        finalPrice = quantity * (price / 12);
    }
    else {
        finalPrice = quantity * price; // default
    }
    
    // Item name extract karo - Tumhari puri list ke saath
    let itemText = transcript
        .replace(/\d+/g, '')
        .replace(/(packet|pack|kg|kgs|kilo|kilogram|gram|grams|bora|bag|litre|liter|metre|meter|bundle|piece|pieces|pcs|unit|item|items|product|saman|maal|ka|ke|ki|kaa|kī|kē|kā|kaun|bhav|bhaw|bhaav|daam|dam|rate|cost|price|mooly|keemat|moolya|माल|सामान|पीस|किलो|ग्राम|पैकेट|बोरा|बंडल|थैला|लिटर|मीटर|का|की|के|का भाव|कीमत|भाव|भव|दाम|रेट|मूल्य|रुपये|रुपया|की दर|का रेट|का दाम|का मूल्य|लीटर)/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    console.log("✅ SMART PARSED:", itemText, "Qty:", quantity, "Rate:", finalPrice);
    
    if (itemText && quantity && finalPrice) {
        return { 
            success: true, 
            name: itemText, 
            quantity: quantity, 
            price: finalPrice 
        };
    }
    
    return { success: false };
}











// Change language
function changeLanguage(lang) {
    currentLanguage = lang;
    if (recognition) {
        recognition.lang = lang;
    }
    const langText = lang === 'hi-IN' ? 'Hindi' : 'English';
    showNotification(`Language changed to ${langText}`, 'info');
    document.getElementById('voiceStatus').textContent = `Language set to ${langText}. Ab bolna shuru karein!`;
    speakText(`Language changed to ${langText}`);
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initSpeechRecognition();
});















// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateInvoicePreview();
    initTextToSpeech();
    initSpeechRecognition();
    initProfileSystem(); // YEH LINE ADD KARO
    initFlipkartStyle();
});
// Initialize the application
function initializeApp() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
    document.getElementById('invoiceNumber').value = 'INV-' + Math.floor(1000 + Math.random() * 9000);
    addItemRow();
    
    // Initialize payment method
    selectPaymentMethod('cash');
}

// Setup all event listeners
function setupEventListeners() {
    // Mobile menu
    document.getElementById('mobileMenuToggle').addEventListener('click', toggleMobileMenu);
    document.getElementById('mobileMenuClose').addEventListener('click', closeMobileMenu);
    
    // Tab navigation
    document.getElementById('prevTabBtn').addEventListener('click', prevTab);
    document.getElementById('nextTabBtn').addEventListener('click', nextTab);
    
    // Template selection
    document.querySelectorAll('.select-template').forEach(btn => {
        btn.addEventListener('click', function() {
            selectTemplate(this.dataset.template);
        });
    });
    
    document.getElementById('templateSelect').addEventListener('change', function() {
        selectTemplate(this.value);
    });
    
    // Items management
    document.getElementById('addItemBtn').addEventListener('click', addItemRow);
    
    // Form inputs for real-time preview
    document.querySelectorAll('#business-tab input, #business-tab textarea').forEach(input => {
        input.addEventListener('input', updateInvoicePreview);
    });
    
    // Discount inputs
    document.getElementById('discountType').addEventListener('change', updateInvoicePreview);
    document.getElementById('discountValue').addEventListener('input', updateInvoicePreview);
    
    // GST Toggle
    document.getElementById('gstToggle').addEventListener('change', updateInvoicePreview);
    
    // UPI ID input
    document.getElementById('upiId').addEventListener('input', function() {
        updateInvoicePreview();
        updateQRCode();
    });
    
    // Action buttons
    document.getElementById('generatePdfBtn').addEventListener('click', generatePDF);
    
    // Industry links
    document.querySelectorAll('.industry-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const industry = this.dataset.industry;
            showIndustryMessage(industry);
        });
    });
    
    // Modal controls
    setupModalControls();
    
    // Auth forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    // Auth modal switching
    document.getElementById('switchToSignup').addEventListener('click', function(e) {
        e.preventDefault();
        switchAuthModal('signup');
    });
    
    document.getElementById('switchToLogin').addEventListener('click', function(e) {
        e.preventDefault();
        switchAuthModal('login');
    });
    
    document.getElementById('forgotPassword').addEventListener('click', function(e) {
        e.preventDefault();
        switchAuthModal('forgotPassword');
    });
    
    // OTP inputs
    setupOTPInputs();
    
    // FAQ
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const item = this.parentElement;
            item.classList.toggle('active');
        });
    });
}

// Mobile menu functions
function toggleMobileMenu() {
    document.getElementById('mobileMenu').classList.toggle('active');
}

function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('active');
}

// Setup modal controls
function setupModalControls() {
    document.getElementById('signupBtn').addEventListener('click', openSignupModal);
    document.getElementById('loginModalClose').addEventListener('click', () => closeModal('loginModal'));
    document.getElementById('signupModalClose').addEventListener('click', () => closeModal('signupModal'));
    document.getElementById('otpModalClose').addEventListener('click', () => closeModal('otpModal'));
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

// Tab navigation functions
function nextTab() {
    if (validateCurrentTab()) {
        const tabs = document.querySelectorAll('.tab-content');
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabs[currentTab].classList.remove('active');
        tabButtons[currentTab].classList.remove('active');
        
        currentTab++;
        
        tabs[currentTab].classList.add('active');
        tabButtons[currentTab].classList.add('active');
        
        updateTabButtons();
        
        if (currentTab === 2) {
            calculateTotals();
        }
    }
}

function prevTab() {
    const tabs = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabs[currentTab].classList.remove('active');
    tabButtons[currentTab].classList.remove('active');
    
    currentTab--;
    
    tabs[currentTab].classList.add('active');
    tabButtons[currentTab].classList.add('active');
    
    updateTabButtons();
}

function updateTabButtons() {
    const prevBtn = document.getElementById('prevTabBtn');
    const nextBtn = document.getElementById('nextTabBtn');
    const generateBtn = document.getElementById('generatePdfBtn');
    
    prevBtn.disabled = currentTab === 0;
    
    if (currentTab === 2) {
        nextBtn.style.display = 'none';
        generateBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        generateBtn.style.display = 'none';
    }
}

function validateCurrentTab() {
    if (currentTab === 0) {
        const userName = document.getElementById('userName').value;
        const vendorName = document.getElementById('vendorName').value;
        
        if (!userName || !vendorName) {
            showNotification('Please fill in both Business Name and Customer Name', 'error');
            return false;
        }
    } else if (currentTab === 1) {
        const itemRows = document.querySelectorAll('.item-row');
        
        if (itemRows.length === 0) {
            showNotification('Please add at least one item', 'error');
            return false;
        }
        
        let hasValidItem = false;
        itemRows.forEach(row => {
            const desc = row.querySelector('.item-desc').value;
            const qty = row.querySelector('.item-qty').value;
            const price = row.querySelector('.item-price').value;
            
            if (desc && qty && price) {
                hasValidItem = true;
            }
        });
        
        if (!hasValidItem) {
            showNotification('Please fill in description, quantity and price for at least one item', 'error');
            return false;
        }
    }
    
    return true;
}

// Item management functions
function addItemRow() {
    const itemsList = document.getElementById('itemsList');
    const itemCount = itemsList.querySelectorAll('.item-row').length + 1;
    
    const itemRow = document.createElement('div');
    itemRow.className = 'item-row';
    itemRow.innerHTML = `
        <input type="text" placeholder="Item description" class="item-desc" value="">
        <input type="number" placeholder="Qty" class="item-qty" value="1" min="1">
        <input type="number" placeholder="Price" class="item-price" value="100" min="0" step="0.01">
        <input type="number" placeholder="Tax %" class="item-tax" value="18" min="0" max="100">
        <button class="remove-item"><i class="fas fa-times"></i></button>
    `;
    
    itemsList.appendChild(itemRow);
    
    itemRow.querySelector('.remove-item').addEventListener('click', function() {
        itemRow.remove();
        updateInvoicePreview();
    });
    
    const inputs = itemRow.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', updateInvoicePreview);
    });
    
    updateInvoicePreview();
}

// Add event listeners to existing remove buttons
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
        e.preventDefault();
        const removeBtn = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
        const itemRow = removeBtn.closest('.item-row');
        
        if (itemRow && itemRow.parentNode) {
            itemRow.remove();
            updateInvoicePreview();
        }
    }
});

// Add event listeners to existing inputs for real-time update
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('item-desc') || 
        e.target.classList.contains('item-qty') || 
        e.target.classList.contains('item-price') || 
        e.target.classList.contains('item-tax')) {
        updateInvoicePreview();
    }
});

// Template selection
function selectTemplate(template) {
    document.getElementById('templateSelect').value = template;
    
    document.querySelectorAll('.template-card').forEach(card => {
        if (card.dataset.template === template) {
            card.style.boxShadow = '0 15px 30px rgba(0, 247, 255, 0.2), var(--neon-glow)';
            card.style.transform = 'translateY(-5px)';
        } else {
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            card.style.transform = 'translateY(0)';
        }
    });
    
    invoiceData.template = template;
    updateInvoicePreview();
}

// Generate Invoice Preview - UPDATED WITH GST TOGGLE AND DISCOUNT
function updateInvoicePreview() {
    const template = document.getElementById('templateSelect').value;
    const businessName = document.getElementById('userName').value || 'Your Business Name';
    const businessAddress = document.getElementById('businessAddress').value || 'Business Address';
    const contactNumber = document.getElementById('contactNumber').value || 'Contact Number';
    const gstNumber = document.getElementById('gstNumber').value || 'GST Number';
    const upiId = document.getElementById('upiId').value || 'UPI ID';
    const customerName = document.getElementById('vendorName').value || 'Customer Name';
    const customerAddress = document.getElementById('vendorAddress').value || 'Customer Address';
    const invoiceDate = document.getElementById('invoiceDate').value;
    const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
    const authorizedSignatory = document.getElementById('authorizedSignatory').value || 'Authorized Signatory';
    
    const gstMode = document.getElementById('gstToggle').checked;
    const discountType = document.getElementById('discountType').value;
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    
    const dateObj = new Date(invoiceDate);
    const formattedDate = invoiceDate ? dateObj.toLocaleDateString('en-IN') : 'Date';
    
    let subtotal = 0;
    let totalTax = 0;
    
    const itemRows = document.querySelectorAll('.item-row');
    const items = [];
    
    itemRows.forEach(row => {
        const desc = row.querySelector('.item-desc').value || 'Item';
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const tax = parseFloat(row.querySelector('.item-tax').value) || 0;
        
        const amount = qty * price;
        const taxAmount = gstMode ? amount * (tax / 100) : 0;
        
        subtotal += amount;
        totalTax += taxAmount;
        
        items.push({
            desc,
            qty,
            price,
            tax,
            amount,
            taxAmount
        });
    });
    
    // Calculate discount
    let discountAmount = 0;
    if (discountType === 'percentage' && discountValue > 0) {
        discountAmount = (subtotal * discountValue) / 100;
    } else if (discountType === 'fixed' && discountValue > 0) {
        discountAmount = discountValue;
    }
    
    const totalAfterDiscount = subtotal - discountAmount;
    const grandTotal = totalAfterDiscount + totalTax;
    
    // Update summary
    document.getElementById('summary-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('summary-discount').textContent = `-₹${discountAmount.toFixed(2)}`;
    document.getElementById('summary-tax').textContent = `₹${totalTax.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `₹${grandTotal.toFixed(2)}`;
    
    // Update QR code amount
    document.getElementById('qrAmount').textContent = grandTotal.toFixed(2);
    
    let previewHTML = `
        <div class="invoice-template ${template}-template">
            <div class="invoice-header">
                <div>
                    <div class="invoice-title">TAX INVOICE</div>
                    <div><strong>${businessName}</strong></div>
                    <div>${businessAddress}</div>
                    <div>${contactNumber}</div>
                    ${gstMode ? `<div>GSTIN: ${gstNumber}</div>` : ''}
                </div>
                <div class="invoice-meta">
                    <div class="invoice-number"><strong>${invoiceNumber}</strong></div>
                    <div class="invoice-date">Date: ${formattedDate}</div>
                </div>
            </div>
            
            <div class="invoice-addresses">
                <div class="address-box">
                    <h3>From:</h3>
                    <div><strong>${businessName}</strong></div>
                    <div>${businessAddress}</div>
                    <div>${contactNumber}</div>
                    ${gstMode ? `<div>GSTIN: ${gstNumber}</div>` : ''}
                </div>
                <div class="address-box">
                    <h3>Bill To:</h3>
                    <div><strong>${customerName}</strong></div>
                    <div>${customerAddress}</div>
                </div>
            </div>
            
            <table class="invoice-items">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Price</th>
                        ${gstMode ? '<th>Tax %</th>' : ''}
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    items.forEach(item => {
        previewHTML += `
            <tr>
                <td>${item.desc}</td>
                <td>${item.qty}</td>
                <td>₹${item.price.toFixed(2)}</td>
                ${gstMode ? `<td>${item.tax}%</td>` : ''}
                <td>₹${(item.amount + item.taxAmount).toFixed(2)}</td>
            </tr>
        `;
    });
    
    previewHTML += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="${gstMode ? '4' : '3'}" style="text-align: right;"><strong>Subtotal:</strong></td>
                        <td><strong>₹${subtotal.toFixed(2)}</strong></td>
                    </tr>
    `;
    
    // Add discount row if applicable
    if (discountAmount > 0) {
        const discountTypeText = discountType === 'percentage' ? `(${discountValue}%)` : '';
        previewHTML += `
                    <tr>
                        <td colspan="${gstMode ? '4' : '3'}" style="text-align: right;"><strong>Discount ${discountTypeText}:</strong></td>
                        <td><strong>-₹${discountAmount.toFixed(2)}</strong></td>
                    </tr>
        `;
    }
    
    // Add tax row if GST is enabled
    if (gstMode && totalTax > 0) {
        previewHTML += `
                    <tr>
                        <td colspan="${gstMode ? '4' : '3'}" style="text-align: right;"><strong>Tax (GST):</strong></td>
                        <td><strong>₹${totalTax.toFixed(2)}</strong></td>
                    </tr>
        `;
    }
    
    previewHTML += `
                    <tr>
                        <td colspan="${gstMode ? '4' : '3'}" style="text-align: right;"><strong>Grand Total:</strong></td>
                        <td><strong>₹${grandTotal.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <!-- Payment Information -->
            <div class="payment-info" style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h4 style="margin-bottom: 10px; color: #333;">Payment Information</h4>
                <p style="margin: 5px 0; color: #555;">
                    <strong>Payment Method:</strong> ${invoiceData.paymentMethod.toUpperCase()}
                </p>
                ${invoiceData.paymentMethod === 'upi' && upiId ? `
                <p style="margin: 5px 0; color: #555;">
                    <strong>UPI ID:</strong> ${upiId}
                </p>
                ` : ''}
            </div>
            
            <div class="invoice-footer">
                <div class="terms-title">Terms & Conditions</div>
                <p>Payment is due within 15 days. Please make checks payable to ${businessName}.</p>
                
                <div class="signature-area">
                    <div>${authorizedSignatory}</div>
                    <div>_________________________</div>
                    <div>Authorized Signature</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('invoicePreview').innerHTML = previewHTML;
}

// Calculate totals function
function calculateTotals() {
    const gstMode = document.getElementById('gstToggle').checked;
    const discountType = document.getElementById('discountType').value;
    const discountValue = parseFloat(document.getElementById('discountValue').value) || 0;
    
    let subtotal = 0;
    let totalTax = 0;
    
    const itemRows = document.querySelectorAll('.item-row');
    
    itemRows.forEach(row => {
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const tax = parseFloat(row.querySelector('.item-tax').value) || 0;
        
        const amount = qty * price;
        const taxAmount = gstMode ? amount * (tax / 100) : 0;
        
        subtotal += amount;
        totalTax += taxAmount;
    });
    
    // Calculate discount
    let discountAmount = 0;
    if (discountType === 'percentage' && discountValue > 0) {
        discountAmount = (subtotal * discountValue) / 100;
    } else if (discountType === 'fixed' && discountValue > 0) {
        discountAmount = discountValue;
    }
    
    const totalAfterDiscount = subtotal - discountAmount;
    const grandTotal = totalAfterDiscount + totalTax;
    
    document.getElementById('summary-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('summary-discount').textContent = `-₹${discountAmount.toFixed(2)}`;
    document.getElementById('summary-tax').textContent = `₹${totalTax.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `₹${grandTotal.toFixed(2)}`;
    
    // Update QR code amount
    document.getElementById('qrAmount').textContent = grandTotal.toFixed(2);
}

// Generate PDF - Single A4 Page (Fitted)
function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    const invoiceElement = document.getElementById('invoicePreview');
    
    const contentHeight = invoiceElement.scrollHeight;
    const scale = contentHeight > 1000 ? 0.6 : 0.8;
    
    html2canvas(invoiceElement, {
        scale: scale,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (imgHeight > pageHeight - 20) {
            const scaleFactor = (pageHeight - 20) / imgHeight;
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth * scaleFactor, imgHeight * scaleFactor);
        } else {
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        }
        
        const fileName = `invoice-${document.getElementById('invoiceNumber').value || '001'}.pdf`;
        pdf.save(fileName);
    }).catch(error => {
        console.error('Error generating PDF:', error);
    });
}









// Share as Image - Works on both mobile & laptop
function shareViaWhatsApp() {
    const invoiceElement = document.getElementById('invoicePreview');
    
    html2canvas(invoiceElement, {
        scale: 0.7,
        useCORS: true,
        logging: false
    }).then(canvas => {
        canvas.toBlob(function(blob) {
            const businessName = document.getElementById('userName').value || 'Your Business';
            const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
            const grandTotal = document.getElementById('summary-total').textContent;
            
            const message = `Invoice ${invoiceNumber} from ${businessName}\nTotal Amount: ${grandTotal}`;
            
            if (navigator.share) {
                const file = new File([blob], "invoice.png", { type: "image/png" });
                navigator.share({
                    files: [file],
                    text: message,
                    title: `Invoice ${invoiceNumber}`
                }).catch(() => {
                    downloadAndAlert(blob, message);
                });
            } else {
                downloadAndAlert(blob, message);
            }
        });
    });
}

function downloadAndAlert(blob, message) {
    const link = document.createElement('a');
    link.download = 'invoice.png';
    link.href = URL.createObjectURL(blob);
    link.click();
    
    setTimeout(() => {
        if(confirm('Invoice image downloaded! Open WhatsApp and send the downloaded image file. Click OK to open WhatsApp.')) {
            window.open(`https://web.whatsapp.com/`, '_blank');
        }
    }, 1000);
}

// Share via Email with Image
function shareViaEmail() {
    const invoiceElement = document.getElementById('invoicePreview');
    
    html2canvas(invoiceElement, {
        scale: 0.7,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        
        const businessName = document.getElementById('userName').value || 'Your Business';
        const customerName = document.getElementById('vendorName').value || 'Customer';
        const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001';
        const grandTotal = document.getElementById('summary-total').textContent;
        
        const subject = `Invoice ${invoiceNumber} from ${businessName}`;
        const body = `Dear ${customerName},\n\nPlease find your invoice ${invoiceNumber} below:\n\nTotal Amount: ${grandTotal}\n\nInvoice Image:\n${imgData}\n\nThank you for your business!\n\n${businessName}`;
        
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
    });
}

// Print Invoice
function printInvoice() {
    const invoiceElement = document.getElementById('invoicePreview');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Invoice</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .invoice-template { max-width: 800px; margin: 0 auto; }
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                ${invoiceElement.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// Industry section interaction
function showIndustryMessage(industry) {
    const messages = {
        retail: "Perfect for retail shops! Create GST bills for your store with itemized products.",
        restaurant: "Ideal for restaurants! Generate food bills with tax calculations.",
        medical: "Medical store billing with medicine details and expiry dates.",
        services: "Service invoices for consultants, freelancers, and professionals."
    };
    
    showNotification(messages[industry] || "This industry is supported!", 'info');
}

// Payment Methods System
function selectPaymentMethod(method) {
    invoiceData.paymentMethod = method;
    
    // Remove active class from all payment buttons
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected payment button
    const selectedBtn = document.querySelector(`.payment-btn[data-payment="${method}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // Show/hide UPI section
    const upiSection = document.getElementById('upiSection');
    if (method === 'upi') {
        upiSection.style.display = 'block';
        updateQRCode();
    } else {
        upiSection.style.display = 'none';
    }
    
    updateInvoicePreview();
}

// Update QR Code
function updateQRCode() {
    const upiId = document.getElementById('upiId').value;
    const totalAmount = document.getElementById('summary-total').textContent.replace('₹', '');
    
    document.getElementById('qrUpiId').textContent = upiId || 'yourname@upi';
    
    // In a real implementation, you would generate a proper QR code here
    // For demo purposes, we'll just show a placeholder
    const qrCodeElement = document.getElementById('qrCode');
    if (qrCodeElement) {
        qrCodeElement.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: white; color: black; font-size: 0.8rem; text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 10px;">📱</div>
                <div>UPI QR Code</div>
                <div style="font-size: 0.7rem; margin-top: 5px;">Amount: ₹${totalAmount}</div>
            </div>
        `;
    }
}

// Copy UPI ID to clipboard
function copyUPIId() {
    const upiId = document.getElementById('upiId').value;
    if (!upiId) {
        showNotification('Please enter UPI ID first', 'error');
        return;
    }
    
    navigator.clipboard.writeText(upiId).then(() => {
        showNotification('UPI ID copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const tempInput = document.createElement('input');
        tempInput.value = upiId;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        showNotification('UPI ID copied to clipboard!', 'success');
    });
}

// Speak Invoice Summary
function speakInvoiceSummary() {
    const businessName = document.getElementById('userName').value || 'Your Business';
    const customerName = document.getElementById('vendorName').value || 'Customer';
    const total = document.getElementById('summary-total').textContent;
    
    const summary = `Invoice summary. From ${businessName} to ${customerName}. Total amount: ${total}. Thank you for using Spark Invoice!`;
    speakText(summary);
    showNotification('Invoice details spoken', 'info');
}

// Calculate Total
function calculateTotal() {
    calculateTotals();
    const total = document.getElementById('summary-total').textContent;
    showNotification(`Total calculated: ${total}`, 'success');
    speakText(`Total calculated ${total}`);
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    showNotification('Logging in...', 'info');
    
    setTimeout(() => {
        showNotification('Login successful!', 'success');
        closeModal('loginModal');
        document.getElementById('loginForm').reset();
    }, 1500);
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    if (!name || !email || !phone || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    showNotification('Creating your account...', 'info');
    
    setTimeout(() => {
        if (sendOTP(phone)) {
            closeModal('signupModal');
        }
    }, 1500);
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function openSignupModal() {
    openModal('signupModal');
}

function switchAuthModal(to) {
    closeModal('loginModal');
    closeModal('signupModal');
    
    if (to === 'signup') {
        openModal('signupModal');
    } else if (to === 'login') {
        openModal('loginModal');
    }
}

// OTP Functions
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            if (this.value.length === 1) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                } else {
                    this.blur();
                    if (isOTPComplete()) {
                        verifyOTP();
                    }
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace') {
                if (this.value.length === 0 && index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
    });
    
    document.querySelector('#otpModal .btn-primary').addEventListener('click', verifyOTP);
    
    document.querySelector('.otp-resend a').addEventListener('click', function(e) {
        e.preventDefault();
        const phone = document.getElementById('signupPhone').value;
        if (phone) {
            sendOTP(phone);
            showNotification('OTP sent again!', 'info');
        } else {
            showNotification('Please enter phone number first', 'error');
        }
    });
}

function isOTPComplete() {
    const otpInputs = document.querySelectorAll('.otp-input');
    for (let input of otpInputs) {
        if (!input.value) return false;
    }
    return true;
}

function getOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    let otp = '';
    otpInputs.forEach(input => {
        otp += input.value;
    });
    return otp;
}

function verifyOTP() {
    const otp = getOTP();
    
    if (otp.length !== 6) {
        showNotification('Please enter complete 6-digit OTP', 'error');
        return;
    }
    
    showNotification('Verifying OTP...', 'info');
    
    setTimeout(() => {
        if (otp.startsWith('1')) {
            showNotification('Phone verified successfully!', 'success');
            closeModal('otpModal');
            resetOTPInputs();
            
            setTimeout(() => {
                showNotification('Account created successfully! You can now login.', 'success');
            }, 1000);
        } else {
            showNotification('Invalid OTP. Please try again.', 'error');
            resetOTPInputs();
        }
    }, 2000);
}

function resetOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach(input => {
        input.value = '';
    });
    if (otpInputs[0]) {
        otpInputs[0].focus();
    }
}

function sendOTP(phoneNumber) {
    if (!phoneNumber) {
        showNotification('Please enter phone number', 'error');
        return false;
    }
    
    openModal('otpModal');
    
    const demoOTP = '123456';
    
    showNotification(`OTP sent to ${phoneNumber}. Demo OTP: ${demoOTP}`, 'info');
    
    setTimeout(() => {
        const otpInputs = document.querySelectorAll('.otp-input');
        const otpArray = demoOTP.split('');
        
        otpArray.forEach((digit, index) => {
            if (otpInputs[index]) {
                otpInputs[index].value = digit;
            }
        });
        
        if (otpInputs[5]) {
            otpInputs[5].focus();
        }
    }, 1000);
    
    return true;
}

// Utility functions
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function formatCurrency(amount) {
    return '₹' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            closeMobileMenu();
        }
    });
});

// Handle touch events for mobile
document.addEventListener('touchstart', function(event) {
    // Add touch-specific handling if needed
});

// Prevent zoom on double tap (iOS)
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Fix viewport height for mobile
function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);

// Load images efficiently for mobile
function loadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadImages();
    setViewportHeight();
    document.body.classList.add('loaded');
});









// ==================== FLIPKART-STYLE E-COMMERCE SYSTEM ====================

let shoppingCart = JSON.parse(localStorage.getItem('flipkartCart')) || [];
let currentStep = 1;

// Initialize System
function initFlipkartStyle() {
    createCartSidebar();
    createCheckoutModal();
    createOrderSuccessModal();
    setupProductButtons();
    updateCartIcon();
}

// Flipkart-style Cart Sidebar
function createCartSidebar() {
    const sidebarHTML = `
    <div id="cartSidebar" style="position: fixed; top: 0; right: -400px; width: 380px; height: 100vh; background: var(--darker); box-shadow: -2px 0 10px rgba(0,0,0,0.1); z-index: 1000; transition: right 0.3s ease; overflow-y: auto; border-left: 1px solid rgba(0, 247, 255, 0.2);">
        <div style="padding: 20px; border-bottom: 1px solid rgba(0, 247, 255, 0.2);">
            <div style="display: flex; justify-content: between; align-items: center;">
                <h2 style="margin: 0; color: var(--primary); font-size: 1.3rem; text-shadow: var(--neon-glow);">My Cart</h2>
                <button onclick="closeCartSidebar()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--light);">×</button>
            </div>
        </div>
        
        <div id="cartItemsContainer" style="padding: 0 20px;">
            <!-- Cart items will appear here -->
        </div>
        
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: var(--darker); border-top: 1px solid rgba(0, 247, 255, 0.2); padding: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-weight: bold; color: var(--light);">
                <span>Total Amount:</span>
                <span style="color: var(--primary); text-shadow: var(--neon-glow);">₹<span id="sidebarTotal">0</span></span>
            </div>
            <button onclick="proceedToCheckout()" style="width: 100%; padding: 15px; background: linear-gradient(45deg, var(--primary), var(--accent)); color: var(--dark); border: none; border-radius: 50px; font-size: 1.1rem; font-weight: bold; cursor: pointer; box-shadow: 0 5px 15px rgba(0, 247, 255, 0.4); transition: all 0.3s ease;">
                PLACE ORDER
            </button>
        </div>
    </div>
    <div id="cartOverlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 999; backdrop-filter: blur(5px);"></div>
    `;
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
}

// Checkout Modal - Flipkart Style
function createCheckoutModal() {
    const checkoutHTML = `
    <div id="checkoutModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--darker); z-index: 1001; overflow-y: auto;">
        <!-- Header -->
        <div style="background: linear-gradient(45deg, var(--primary), var(--accent)); color: var(--dark); padding: 15px 20px; display: flex; align-items: center; gap: 15px;">
            <button onclick="closeCheckout()" style="background: none; border: none; color: var(--dark); font-size: 1.2rem; cursor: pointer; font-weight: bold;">←</button>
            <h2 style="margin: 0; font-size: 1.3rem; font-weight: bold;">Checkout</h2>
        </div>
        
        <!-- Progress Steps -->
        <div style="display: flex; padding: 20px; background: rgba(0, 0, 0, 0.3); border-bottom: 1px solid rgba(0, 247, 255, 0.2);">
            <div style="flex: 1; text-align: center;">
                <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--primary); color: var(--dark); display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-weight: bold; box-shadow: var(--neon-glow);">1</div>
                <span style="font-size: 0.9rem; color: var(--primary); font-weight: bold; text-shadow: var(--neon-glow);">Delivery Address</span>
            </div>
            <div style="flex: 1; text-align: center;">
                <div style="width: 30px; height: 30px; border-radius: 50%; background: rgba(0, 247, 255, 0.3); color: var(--light); display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-weight: bold;">2</div>
                <span style="font-size: 0.9rem; color: var(--light); opacity: 0.8;">Order Summary</span>
            </div>
            <div style="flex: 1; text-align: center;">
                <div style="width: 30px; height: 30px; border-radius: 50%; background: rgba(0, 247, 255, 0.3); color: var(--light); display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-weight: bold;">3</div>
                <span style="font-size: 0.9rem; color: var(--light); opacity: 0.8;">Payment</span>
            </div>
        </div>
        
        <!-- Step 1: Delivery Address -->
        <div id="step1" style="padding: 20px;">
            <h3 style="margin-bottom: 20px; color: var(--primary); text-shadow: var(--neon-glow);">Add Delivery Address</h3>
            
            <div style="background: var(--card-bg); border-radius: 20px; padding: 20px; border: 1px solid rgba(0, 247, 255, 0.2); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px);">
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--primary);">Full Name *</label>
                        <input type="text" id="customerName" placeholder="Enter your full name" style="width: 100%; padding: 12px; border: 1px solid rgba(0, 247, 255, 0.3); border-radius: 10px; font-size: 1rem; background: rgba(0, 0, 0, 0.3); color: var(--light); transition: all 0.3s ease;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--primary);">Phone Number *</label>
                        <input type="tel" id="customerPhone" placeholder="10-digit mobile number" style="width: 100%; padding: 12px; border: 1px solid rgba(0, 247, 255, 0.3); border-radius: 10px; font-size: 1rem; background: rgba(0, 0, 0, 0.3); color: var(--light); transition: all 0.3s ease;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--primary);">Pincode *</label>
                        <input type="text" id="customerPincode" placeholder="Enter pincode" style="width: 100%; padding: 12px; border: 1px solid rgba(0, 247, 255, 0.3); border-radius: 10px; font-size: 1rem; background: rgba(0, 0, 0, 0.3); color: var(--light); transition: all 0.3s ease;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--primary);">Full Address *</label>
                        <textarea id="customerAddress" placeholder="House No., Building, Street, Area, City" rows="3" style="width: 100%; padding: 12px; border: 1px solid rgba(0, 247, 255, 0.3); border-radius: 10px; font-size: 1rem; background: rgba(0, 0, 0, 0.3); color: var(--light); resize: vertical; transition: all 0.3s ease;"></textarea>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 500; color: var(--primary);">Landmark (Optional)</label>
                        <input type="text" id="customerLandmark" placeholder="Nearby landmark" style="width: 100%; padding: 12px; border: 1px solid rgba(0, 247, 255, 0.3); border-radius: 10px; font-size: 1rem; background: rgba(0, 0, 0, 0.3); color: var(--light); transition: all 0.3s ease;">
                    </div>
                </div>
                
                <button onclick="goToStep(2)" style="width: 100%; padding: 15px; background: linear-gradient(45deg, var(--primary), var(--accent)); color: var(--dark); border: none; border-radius: 50px; font-size: 1.1rem; font-weight: bold; cursor: pointer; margin-top: 20px; box-shadow: 0 5px 15px rgba(0, 247, 255, 0.4); transition: all 0.3s ease;">
                    CONTINUE
                </button>
            </div>
        </div>
        
        <!-- Step 2: Order Summary -->
        <div id="step2" style="padding: 20px; display: none;">
            <h3 style="margin-bottom: 20px; color: var(--primary); text-shadow: var(--neon-glow);">Order Summary</h3>
            
            <div style="background: var(--card-bg); border-radius: 20px; padding: 20px; border: 1px solid rgba(0, 247, 255, 0.2); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px); margin-bottom: 20px;">
                <div id="orderSummaryItems"></div>
                
                <div style="border-top: 1px solid rgba(0, 247, 255, 0.2); padding-top: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--light);">
                        <span>Total MRP</span>
                        <span>₹<span id="totalMRP">0</span></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--light);">
                        <span>Delivery Charges</span>
                        <span style="color: var(--accent); text-shadow: var(--accent-glow);">FREE</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem; padding-top: 10px; border-top: 1px dashed rgba(0, 247, 255, 0.2); color: var(--light);">
                        <span>Total Amount</span>
                        <span style="color: var(--primary); text-shadow: var(--neon-glow);">₹<span id="orderTotal">0</span></span>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="goToStep(1)" style="flex: 1; padding: 15px; background: transparent; color: var(--primary); border: 2px solid var(--primary); border-radius: 50px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: all 0.3s ease;">
                    BACK
                </button>
                <button onclick="goToStep(3)" style="flex: 1; padding: 15px; background: linear-gradient(45deg, var(--primary), var(--accent)); color: var(--dark); border: none; border-radius: 50px; font-size: 1rem; font-weight: bold; cursor: pointer; box-shadow: 0 5px 15px rgba(0, 247, 255, 0.4); transition: all 0.3s ease;">
                    CONTINUE
                </button>
            </div>
        </div>
        
        <!-- Step 3: Payment -->
        <div id="step3" style="padding: 20px; display: none;">
            <h3 style="margin-bottom: 20px; color: var(--primary); text-shadow: var(--neon-glow);">Select Payment Method</h3>
            
            <div style="background: var(--card-bg); border-radius: 20px; padding: 20px; border: 1px solid rgba(0, 247, 255, 0.2); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px); margin-bottom: 20px;">
                <div style="margin-bottom: 15px;">
                    <h4 style="margin-bottom: 15px; color: var(--primary);">UPI Apps</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="payment-option" onclick="selectPayment('phonepe')" style="border: 2px solid rgba(0, 247, 255, 0.3); border-radius: 15px; padding: 15px; text-align: center; cursor: pointer; background: rgba(0, 0, 0, 0.3); transition: all 0.3s ease;">
                            <div style="font-size: 2rem; margin-bottom: 8px;">📱</div>
                            <div style="font-weight: bold; color: var(--primary);">PhonePe</div>
                        </div>
                        <div class="payment-option" onclick="selectPayment('gpay')" style="border: 2px solid rgba(0, 247, 255, 0.3); border-radius: 15px; padding: 15px; text-align: center; cursor: pointer; background: rgba(0, 0, 0, 0.3); transition: all 0.3s ease;">
                            <div style="font-size: 2rem; margin-bottom: 8px;">💸</div>
                            <div style="font-weight: bold; color: var(--primary);">Google Pay</div>
                        </div>
                        <div class="payment-option" onclick="selectPayment('paytm')" style="border: 2px solid rgba(0, 247, 255, 0.3); border-radius: 15px; padding: 15px; text-align: center; cursor: pointer; background: rgba(0, 0, 0, 0.3); transition: all 0.3s ease;">
                            <div style="font-size: 2rem; margin-bottom: 8px;">🏪</div>
                            <div style="font-weight: bold; color: var(--primary);">Paytm</div>
                        </div>
                        <div class="payment-option" onclick="selectPayment('amazonpay')" style="border: 2px solid rgba(0, 247, 255, 0.3); border-radius: 15px; padding: 15px; text-align: center; cursor: pointer; background: rgba(0, 0, 0, 0.3); transition: all 0.3s ease;">
                            <div style="font-size: 2rem; margin-bottom: 8px;">📦</div>
                            <div style="font-weight: bold; color: var(--primary);">Amazon Pay</div>
                        </div>
                    </div>
                </div>
                
                <div style="border-top: 1px solid rgba(0, 247, 255, 0.2); padding-top: 15px;">
                    <h4 style="margin-bottom: 15px; color: var(--primary);">Other Payment Methods</h4>
                    <div style="display: grid; gap: 10px;">
                        <div class="payment-option" onclick="selectPayment('card')" style="border: 2px solid rgba(0, 247, 255, 0.3); border-radius: 15px; padding: 15px; cursor: pointer; background: rgba(0, 0, 0, 0.3); transition: all 0.3s ease;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="font-size: 1.5rem;">💳</div>
                                <div>
                                    <div style="font-weight: bold; color: var(--light);">Credit/Debit Card</div>
                                    <div style="font-size: 0.9rem; color: var(--light); opacity: 0.8;">Pay using your card</div>
                                </div>
                            </div>
                        </div>
                        <div class="payment-option" onclick="selectPayment('cod')" style="border: 2px solid rgba(0, 247, 255, 0.3); border-radius: 15px; padding: 15px; cursor: pointer; background: rgba(0, 0, 0, 0.3); transition: all 0.3s ease;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="font-size: 1.5rem;">📦</div>
                                <div>
                                    <div style="font-weight: bold; color: var(--light);">Cash on Delivery</div>
                                    <div style="font-size: 0.9rem; color: var(--light); opacity: 0.8;">Pay when you receive</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button onclick="goToStep(2)" style="flex: 1; padding: 15px; background: transparent; color: var(--primary); border: 2px solid var(--primary); border-radius: 50px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: all 0.3s ease;">
                    BACK
                </button>
                <button onclick="processPayment()" style="flex: 1; padding: 15px; background: linear-gradient(45deg, var(--primary), var(--accent)); color: var(--dark); border: none; border-radius: 50px; font-size: 1rem; font-weight: bold; cursor: pointer; box-shadow: 0 5px 15px rgba(0, 247, 255, 0.4); transition: all 0.3s ease;">
                    PAY ₹<span id="paymentAmount">0</span>
                </button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', checkoutHTML);
}

// Order Success Modal
function createOrderSuccessModal() {
    const successHTML = `
    <div id="orderSuccessModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--darker); z-index: 1002;">
        <div style="text-align: center; padding: 60px 20px;">
            <div style="font-size: 5rem; margin-bottom: 20px; animation: float 3s ease-in-out infinite;">🎉</div>
            <h2 style="color: var(--primary); margin-bottom: 10px; text-shadow: var(--neon-glow);">Order Placed Successfully!</h2>
            <p style="color: var(--light); margin-bottom: 30px; font-size: 1.1rem; opacity: 0.9;">Thank you for shopping with us</p>
            
            <div style="background: var(--card-bg); border-radius: 20px; padding: 25px; margin: 0 auto 30px; max-width: 400px; text-align: left; border: 1px solid rgba(0, 247, 255, 0.2); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px);">
                <h3 style="margin-bottom: 15px; color: var(--accent); text-shadow: var(--accent-glow);">Order Details</h3>
                <div id="successOrderDetails" style="color: var(--light);"></div>
            </div>
            
            <div style="color: var(--light); margin-bottom: 40px; opacity: 0.8;">
                <p>📞 You will receive a confirmation call within 24 hours</p>
                <p>📦 Expected delivery: 2-3 working days</p>
                <p>🛵 Free delivery | Easy returns</p>
            </div>
            
            <button onclick="closeOrderSuccess()" style="padding: 15px 40px; background: linear-gradient(45deg, var(--primary), var(--accent)); color: var(--dark); border: none; border-radius: 50px; font-size: 1.1rem; font-weight: bold; cursor: pointer; box-shadow: 0 5px 15px rgba(0, 247, 255, 0.4); transition: all 0.3s ease;">
                Continue Shopping
            </button>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', successHTML);
}

// Product Buttons
function setupProductButtons() {
    const products = document.querySelectorAll('.hardware-card');
    
    products.forEach((product, index) => {
        const buyButton = product.querySelector('.btn-primary');
        buyButton.innerHTML = 'ADD TO CART';
        buyButton.style.cursor = 'pointer';
        buyButton.style.background = 'linear-gradient(45deg, var(--primary), var(--accent))';
        buyButton.style.color = 'var(--dark)';
        buyButton.style.border = 'none';
        buyButton.style.padding = '12px 24px';
        buyButton.style.borderRadius = '50px';
        buyButton.style.fontWeight = 'bold';
        buyButton.style.boxShadow = '0 5px 15px rgba(0, 247, 255, 0.4)';
        buyButton.style.transition = 'all 0.3s ease';
        
        buyButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productName = product.querySelector('h3').textContent;
            const priceText = product.querySelector('.price').textContent;
            const price = parseInt(priceText.replace(/[₹,]/g, ''));
            
            addToCart(productName, price, index);
            showFlipkartNotification(`"${productName}" added to cart!`);
        });
    });
}

// Add to Cart Function
function addToCart(name, price, id) {
    const existingItem = shoppingCart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        shoppingCart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    localStorage.setItem('flipkartCart', JSON.stringify(shoppingCart));
    updateCartSidebar();
    updateCartIcon();
    showCartSidebar();
}

// Update Cart Sidebar
function updateCartSidebar() {
    const container = document.getElementById('cartItemsContainer');
    const totalEl = document.getElementById('sidebarTotal');
    const paymentAmountEl = document.getElementById('paymentAmount');
    
    if (shoppingCart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--light); opacity: 0.8;">
                <div style="font-size: 4rem; margin-bottom: 15px; animation: float 3s ease-in-out infinite;">🛒</div>
                <h3 style="margin: 0 0 10px 0; color: var(--primary);">Your cart is empty</h3>
                <p>Add some items to get started</p>
            </div>
        `;
        totalEl.textContent = '0';
        paymentAmountEl.textContent = '0';
        return;
    }
    
    let itemsHTML = '';
    let total = 0;
    
    shoppingCart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid rgba(0, 247, 255, 0.2);">
                <div style="width: 60px; height: 60px; background: rgba(0, 247, 255, 0.1); border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: 1px solid rgba(0, 247, 255, 0.3);">
                    📦
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; font-size: 0.9rem; color: var(--light);">${item.name}</h4>
                    <p style="margin: 0 0 8px 0; color: var(--primary); font-weight: bold; text-shadow: var(--neon-glow);">₹${item.price}</p>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="updateQuantity(${index}, -1)" style="background: rgba(0, 247, 255, 0.1); border: 1px solid rgba(0, 247, 255, 0.3); width: 25px; height: 25px; border-radius: 50%; cursor: pointer; color: var(--light); transition: all 0.3s ease;">-</button>
                        <span style="font-weight: bold; color: var(--light);">${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)" style="background: rgba(0, 247, 255, 0.1); border: 1px solid rgba(0, 247, 255, 0.3); width: 25px; height: 25px; border-radius: 50%; cursor: pointer; color: var(--light); transition: all 0.3s ease;">+</button>
                        <button onclick="removeFromCart(${index})" style="margin-left: auto; background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.9rem; text-shadow: var(--neon-glow); transition: all 0.3s ease;">REMOVE</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = itemsHTML;
    totalEl.textContent = total;
    paymentAmountEl.textContent = total;
    
    // Update order summary
    updateOrderSummary();
}

// Update Quantity
function updateQuantity(index, change) {
    shoppingCart[index].quantity += change;
    
    if (shoppingCart[index].quantity <= 0) {
        shoppingCart.splice(index, 1);
    }
    
    localStorage.setItem('flipkartCart', JSON.stringify(shoppingCart));
    updateCartSidebar();
    updateCartIcon();
}

// Remove from Cart
function removeFromCart(index) {
    shoppingCart.splice(index, 1);
    localStorage.setItem('flipkartCart', JSON.stringify(shoppingCart));
    updateCartSidebar();
    updateCartIcon();
    showFlipkartNotification('Item removed from cart');
}

// Update Cart Icon in Header
function updateCartIcon() {
    let cartBtn = document.getElementById('flipkartCartIcon');
    
    if (!cartBtn) {
        const navButtons = document.querySelector('.nav-buttons');
        cartBtn = document.createElement('button');
        cartBtn.id = 'flipkartCartIcon';
        cartBtn.className = 'btn btn-primary'; // YEH LINE ADD KARO
        cartBtn.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>🛒</span>
                <span>Cart</span>
                <span id="flipkartCartCount" style="background: var(--dark); color: var(--accent); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold;">0</span>
            </div>
        `;
        cartBtn.onclick = showCartSidebar;
        navButtons.prepend(cartBtn);
        
        // Size chota karne ke liye CSS apply karo
        cartBtn.style.padding = "10px 20px"; // Thoda chota padding
        cartBtn.style.fontSize = "0.9rem"; // Thoda chota font
    }
    
    const totalItems = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('flipkartCartCount').textContent = totalItems;
}

// Show Cart Sidebar
function showCartSidebar() {
    document.getElementById('cartSidebar').style.right = '0';
    document.getElementById('cartOverlay').style.display = 'block';
}

function closeCartSidebar() {
    document.getElementById('cartSidebar').style.right = '-400px';
    document.getElementById('cartOverlay').style.display = 'none';
}

// Proceed to Checkout
function proceedToCheckout() {
    if (shoppingCart.length === 0) {
        showFlipkartNotification('Your cart is empty!');
        return;
    }
    
    closeCartSidebar();
    document.getElementById('checkoutModal').style.display = 'block';
    goToStep(1);
}

function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
    currentStep = 1;
}

// Step Navigation
function goToStep(step) {
    // Hide all steps
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'none';
    
    // Show current step
    document.getElementById('step' + step).style.display = 'block';
    currentStep = step;
    
    if (step === 2) {
        updateOrderSummary();
    }
}

// Update Order Summary
function updateOrderSummary() {
    const container = document.getElementById('orderSummaryItems');
    const totalMRPEl = document.getElementById('totalMRP');
    const orderTotalEl = document.getElementById('orderTotal');
    
    let itemsHTML = '';
    let total = 0;
    
    shoppingCart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div style="display: flex; gap: 15px; padding: 12px 0; border-bottom: 1px solid rgba(0, 247, 255, 0.2);">
                <div style="width: 50px; height: 50px; background: rgba(0, 247, 255, 0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(0, 247, 255, 0.3);">
                    📦
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 500; margin-bottom: 5px; color: var(--light);">${item.name}</div>
                    <div style="color: var(--primary); font-weight: bold; text-shadow: var(--neon-glow);">₹${item.price} × ${item.quantity}</div>
                </div>
                <div style="font-weight: bold; color: var(--light);">₹${itemTotal}</div>
            </div>
        `;
    });
    
    container.innerHTML = itemsHTML;
    totalMRPEl.textContent = total;
    orderTotalEl.textContent = total;
}

// Select Payment Method
let selectedPayment = '';
function selectPayment(method) {
    selectedPayment = method;
    
    // Remove active class from all
    document.querySelectorAll('.payment-option').forEach(option => {
        option.style.borderColor = 'rgba(0, 247, 255, 0.3)';
        option.style.background = 'rgba(0, 0, 0, 0.3)';
    });
    
    // Add active class to selected
    event.currentTarget.style.borderColor = 'var(--primary)';
    event.currentTarget.style.background = 'rgba(0, 247, 255, 0.2)';
    event.currentTarget.style.boxShadow = 'var(--neon-glow)';
}

// Process Payment
function processPayment() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const pincode = document.getElementById('customerPincode').value;
    const address = document.getElementById('customerAddress').value;
    
    // Validation
    if (!name || !phone || !pincode || !address) {
        showFlipkartNotification('Please fill all required fields');
        return;
    }
    
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
        showFlipkartNotification('Please enter valid 10-digit phone number');
        return;
    }
    
    if (!selectedPayment) {
        showFlipkartNotification('Please select a payment method');
        return;
    }
    
    // Create order
    const order = {
        orderId: 'SPK' + Date.now(),
        customer: {
            name: name,
            phone: phone,
            pincode: pincode,
            address: address
        },
        items: [...shoppingCart],
        total: shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentMethod: selectedPayment,
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN')
    };
    
    // Show processing
    showFlipkartNotification(`Processing ${selectedPayment.toUpperCase()} payment...`);
    
    // Simulate payment success
    setTimeout(() => {
        showOrderSuccess(order);
    }, 2000);
}

// Show Order Success
function showOrderSuccess(order) {
    const detailsContainer = document.getElementById('successOrderDetails');
    
    detailsContainer.innerHTML = `
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Order ID:</strong> <span style="color: var(--light);">${order.orderId}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Customer:</strong> <span style="color: var(--light);">${order.customer.name}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Phone:</strong> <span style="color: var(--light);">${order.customer.phone}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Address:</strong> <span style="color: var(--light);">${order.customer.address}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Pincode:</strong> <span style="color: var(--light);">${order.customer.pincode}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Total Amount:</strong> <span style="color: var(--accent); text-shadow: var(--accent-glow);">₹${order.total}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Payment Method:</strong> <span style="color: var(--light);">${order.paymentMethod.toUpperCase()}</span></div>
        <div style="margin-bottom: 8px;"><strong style="color: var(--primary);">Order Date:</strong> <span style="color: var(--light);">${order.date} ${order.time}</span></div>
    `;
    
    // Clear cart
    shoppingCart = [];
    localStorage.removeItem('flipkartCart');
    updateCartIcon();
    
    closeCheckout();
    document.getElementById('orderSuccessModal').style.display = 'block';
}

function closeOrderSuccess() {
    document.getElementById('orderSuccessModal').style.display = 'none';
}

// Flipkart-style Notification
function showFlipkartNotification(message) {
    // Remove existing notification
    const existingNotif = document.getElementById('flipkartNotif');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notif = document.createElement('div');
    notif.id = 'flipkartNotif';
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--card-bg);
        color: var(--light);
        padding: 15px 20px;
        border-radius: 15px;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3), var(--neon-glow);
        border: 1px solid rgba(0, 247, 255, 0.3);
        backdrop-filter: blur(10px);
    `;
    notif.textContent = message;
    
    document.body.appendChild(notif);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notif.parentNode) {
                notif.parentNode.removeChild(notif);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize System
document.addEventListener('DOMContentLoaded', function() {
    initFlipkartStyle();
});




function setupMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileSignupBtn = document.getElementById('mobileSignupBtn');
    const mobileCartBtn = document.getElementById('mobileCartBtn');
    
    // Signup button functionality
    mobileSignupBtn.addEventListener('click', function() {
        // Open signup modal
        openSignupModal();
        // Close mobile menu
        closeMobileMenu();
    });
    
    // Cart button functionality  
    mobileCartBtn.addEventListener('click', function() {
        showCartSidebar();
        closeMobileMenu();
    });
}

// Cart count update function
function updateMobileCartCount() {
    const mobileCartCount = document.getElementById('mobileCartCount');
    const totalItems = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    if (mobileCartCount) {
        mobileCartCount.textContent = totalItems;
    }
}

// Update cart functions mein mobile count ko bhi update karo
function updateCartIcon() {
    // ... existing code ...
    updateMobileCartCount(); // Add this line
}







// Update Cart Icon in Header
function updateCartIcon() {
    let cartBtn = document.getElementById('flipkartCartIcon');
    
    if (!cartBtn) {
        const navButtons = document.querySelector('.nav-buttons');
        cartBtn = document.createElement('button');
        cartBtn.id = 'flipkartCartIcon';
        cartBtn.className = 'btn btn-primary';
        cartBtn.innerHTML = `
            <div style="display: flex; align-items: center; gap: 6px;">
                <span>🛒</span>
                <span>Cart</span>
                <span id="flipkartCartCount" style="background: var(--dark); color: var(--accent); border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold;">0</span>
            </div>
        `;
        cartBtn.onclick = showCartSidebar;
        navButtons.prepend(cartBtn);
        
        // Mobile ke liye compact size
        cartBtn.style.padding = "8px 16px";
        cartBtn.style.fontSize = "0.85rem";
        cartBtn.style.minWidth = "auto";
        
        // IMPORTANT: Ensure cart button is always visible in desktop
        cartBtn.style.display = "block";
    }
    
    const totalItems = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('flipkartCartCount').textContent = totalItems;
}

// Mobile view check function update karo
function checkMobileView() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const signupBtn = document.getElementById('signupBtn');
    const cartBtn = document.getElementById('flipkartCartIcon');
    
    if (window.innerWidth <= 768) {
        mobileMenuToggle.style.display = 'block';
        if (signupBtn) signupBtn.style.display = 'none';
        if (cartBtn) cartBtn.style.display = 'none'; // Mobile pe cart hide
    } else {
        mobileMenuToggle.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'block';
        if (cartBtn) cartBtn.style.display = 'block'; // Desktop pe cart show
        closeMobileMenu();
    }
}










// Item Description Voice Input
function startItemDescriptionVoice() {
    if (!recognition) {
        showNotification('Voice recognition not available', 'error');
        return;
    }
    
    if (isListening) {
        recognition.stop();
        return;
    }
    
    currentVoiceType = 'item-description';
    recognition.lang = currentLanguage;
    recognition.start();
    
    document.getElementById('voiceStatus').textContent = "🎤 Item/Product name bolein jaise: 'Tomato', 'Onion', 'Mobile Phone'";
}







// Process Item Description
function processItemDescription(transcript) {
    let itemName = transcript.trim();
    
    if (itemName && itemName.length > 1) {
        setLastItemDescription(itemName);
        document.getElementById('voiceStatus').textContent = `✅ Item name set: ${itemName}`;
        speakText(`Item name set ${itemName}`);
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak item name clearly";
    }
}










function setLastItemName(itemName) {
    const itemRows = document.querySelectorAll('.item-row, .product-row, tr.item');
    let lastItem;
    
    if (itemRows.length > 0) {
        lastItem = itemRows[itemRows.length - 1];
        const lastItemName = lastItem.querySelector('.item-name').value;
        const lastItemQty = lastItem.querySelector('.item-qty').value;
        const lastItemPrice = lastItem.querySelector('.item-price').value;
        
        if (!lastItemName && !lastItemQty && !lastItemPrice) {
            console.log("✅ Using empty last row");
        } else {
            console.log("✅ Last row filled, adding new row");
            addItemRow();
            setTimeout(() => {
                const newRows = document.querySelectorAll('.item-row, .product-row, tr.item');
                lastItem = newRows[newRows.length - 1];
                setItemNameInRow(lastItem, itemName);
            }, 50);
            return;
        }
    } else {
        console.log("✅ No rows, adding first row");
        addItemRow();
        setTimeout(() => {
            const newRows = document.querySelectorAll('.item-row, .product-row, tr.item');
            lastItem = newRows[newRows.length - 1];
            setItemNameInRow(lastItem, itemName);
        }, 50);
        return;
    }
    
    setItemNameInRow(lastItem, itemName);
}

function setItemNameInRow(row, itemName) {
    const nameInput = row.querySelector('.item-name');
    if (nameInput) {
        nameInput.value = itemName;
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log("✅ Item name set:", itemName);
    }
}








function processItemName(transcript) {
    console.log("Raw transcript:", transcript);
    
    // English + Hindi dono languages ke liye cleaning
    let itemName = transcript
        .replace(/^(item|product|आइटम|प्रोडक्ट|वस्तु|उत्पाद)\s+/i, '')  // Start se remove
        .replace(/\s+(item|product|आइटम|प्रोडक्ट|वस्तु|उत्पाद)$/i, '')  // End se remove
        .trim();
    
    console.log("Cleaned item name:", itemName);
    
    if (itemName && itemName.length > 1) {
        // Direct set karo
        addItemRow();
        setTimeout(() => {
            const rows = document.querySelectorAll('.item-row');
            const lastRow = rows[rows.length - 1];
            const nameInput = lastRow.querySelector('.item-desc');
            if (nameInput) {
                nameInput.value = itemName;
                updateInvoicePreview();
                console.log("✅ Item set:", itemName);
                document.getElementById('voiceStatus').textContent = `✅ Item set: ${itemName}`;
                speakText(`Item set ${itemName}`);
            }
        }, 500);
    } else {
        document.getElementById('voiceStatus').textContent = "❌ Please speak only product name like 'Laptop', 'Mobile'";
    }
}

































// ==================== REAL SIGNUP SYSTEM ====================

// Open REAL signup page with OTP system
function openSignupPage() {
    window.open('triple-login.html', 'SparkInvoice Signup', 'width=500,height=700,scrollbars=no,resizable=no');
}

// Handle successful signup from popup
window.addEventListener('message', function(event) {
    if (event.data.type === 'SIGNUP_SUCCESS') {
        const user = event.data.user;
        showNotification(`Welcome ${user.name}! Account created successfully.`, 'success');
        updateUserProfile(user);
    }
});



// Toggle profile menu
function toggleProfileMenu() {
    const menu = document.querySelector('.profile-menu');
    menu.classList.toggle('show');
}

// Logout function
function logout() {
    localStorage.removeItem('current_user');
    location.reload();
}

// Check login status on page load
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('current_user'));
    if (user) updateUserProfile(user);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', checkLoginStatus);




















// ==================== COMPLETE PROFILE MANAGEMENT SYSTEM ====================

// User Profile Data Structure
let userProfile = {
    personal: {
        name: '',
        email: '',
        phone: '',
        profilePhoto: '',
        address: ''
    },
    business: {
        name: '',
        type: '',
        address: '',
        gstNumber: '',
        website: '',
        logo: ''
    },
    invoices: [],
    payments: [],
    subscription: {
        plan: 'free',
        expiry: null,
        features: ['Basic Invoices', 'Voice Commands', '3 Templates']
    },
    customers: [],
    settings: {
        language: 'hi-IN',
        theme: 'dark',
        autoSave: true,
        notifications: true
    }
};

// Initialize Profile System
function initProfileSystem() {
    loadUserData();
    createProfileModal();
    createInvoiceHistoryModal();
    createPaymentHistoryModal();
    createSubscriptionModal();
    createCustomersModal();
    createSparkPayModal();
    createLendingModal();
}

// Load User Data from Local Storage
function loadUserData() {
    const savedUser = localStorage.getItem('sparkinvoice_user');
    const savedProfile = localStorage.getItem('sparkinvoice_profile');
    const savedInvoices = localStorage.getItem('sparkinvoice_invoices');
    const savedCustomers = localStorage.getItem('sparkinvoice_customers');
    
    if (savedUser) {
        const user = JSON.parse(savedUser);
        updateUserProfile(user);
    }
    
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
    }
    
    if (savedInvoices) {
        userProfile.invoices = JSON.parse(savedInvoices);
    }
    
    if (savedCustomers) {
        userProfile.customers = JSON.parse(savedCustomers);
    }
}

// Save User Data to Local Storage
function saveUserData() {
    localStorage.setItem('sparkinvoice_profile', JSON.stringify(userProfile));
    localStorage.setItem('sparkinvoice_invoices', JSON.stringify(userProfile.invoices));
    localStorage.setItem('sparkinvoice_customers', JSON.stringify(userProfile.customers));
}

// Enhanced Profile Update Function
function updateUserProfile(user) {
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) signupBtn.style.display = 'none';
    
    // Update user profile data
    userProfile.personal.name = user.name;
    userProfile.personal.email = user.email;
    userProfile.personal.phone = user.phone;
    userProfile.business.name = user.businessName || `${user.name}'s Business`;
    
    let profileSection = document.getElementById('profileSection');
    if (!profileSection) {
        profileSection = document.createElement('div');
        profileSection.id = 'profileSection';
        profileSection.className = 'profile-section';
        profileSection.innerHTML = `
            <div class="profile-dropdown">
                <button class="profile-btn" onclick="toggleProfileMenu()">
                    <div class="profile-avatar">
                        <img src="${userProfile.personal.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=00f7ff&color=050510&bold=true'}" alt="Profile" id="profileAvatar">
                    </div>
                    <span id="userNameDisplay">${user.name}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="profile-menu">
                    <div class="profile-header">
                        <div class="profile-avatar-large">
                            <img src="${userProfile.personal.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=00f7ff&color=050510&bold=true'}" alt="Profile" id="profileAvatarLarge">
                            <button class="edit-photo-btn" onclick="openPhotoUpload()">
                                <i class="fas fa-camera"></i>
                            </button>
                        </div>
                        <div class="profile-info">
                            <div id="profileUserName">${user.name}</div>
                            <div id="profileBusiness">${userProfile.business.name}</div>
                            <div class="profile-plan-badge" id="planBadge">${userProfile.subscription.plan.toUpperCase()} PLAN</div>
                        </div>
                    </div>
                    
                    <div class="profile-menu-section">
                        <a href="#" onclick="openProfileModal(); closeProfileMenu();">
                            <i class="fas fa-user"></i> My Profile
                        </a>
                        <a href="#" onclick="openBusinessModal(); closeProfileMenu();">
                            <i class="fas fa-building"></i> Business Details
                        </a>
                        <a href="#" onclick="openInvoiceHistory(); closeProfileMenu();">
                            <i class="fas fa-file-invoice"></i> Invoice History
                            <span class="menu-badge">${userProfile.invoices.length}</span>
                        </a>

                                                <a href="#" onclick="openLoanManagement(); closeProfileMenu();">
                            <i class="fas fa-hand-holding-usd"></i> Loan Management
                            <span class="menu-badge">${loanCustomers.length}</span>
                        </a>





                        <a href="#" onclick="openPaymentHistory(); closeProfileMenu();">
                            <i class="fas fa-rupee-sign"></i> Payment History
                            <span class="menu-badge">${userProfile.payments.length}</span>
                        </a>
                        <a href="#" onclick="openSubscriptionModal(); closeProfileMenu();">
                            <i class="fas fa-crown"></i> Subscription Plans
                        </a>
                        <a href="#" onclick="openCustomersModal(); closeProfileMenu();">
                            <i class="fas fa-users"></i> Customers
                            <span class="menu-badge">${userProfile.customers.length}</span>
                        </a>
                        <a href="#" onclick="openSparkPayModal(); closeProfileMenu();">
                            <i class="fas fa-wallet"></i> Spark Pay
                            <span class="menu-new">NEW</span>
                        </a>



                                                <a href="#" onclick="openCustomerHistory(); closeProfileMenu();">
                            <i class="fas fa-history"></i> Customer History
                            <span class="menu-badge" id="customerHistoryBadge">0</span>
                        </a>




                        <a href="#" onclick="openLendingModal(); closeProfileMenu();">
                            <i class="fas fa-hand-holding-usd"></i> Business Loans
                        </a>
                        <a href="#" onclick="openSettingsModal(); closeProfileMenu();">
                            <i class="fas fa-cog"></i> Settings
                        </a>
                    </div>
                    
                    <div class="profile-menu-footer">
                        <a href="#" onclick="logout()" class="logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </a>
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.nav-buttons').appendChild(profileSection);
    } else {
        // Update existing profile section
        document.getElementById('userNameDisplay').textContent = user.name;
        document.getElementById('profileUserName').textContent = user.name;
        document.getElementById('profileBusiness').textContent = userProfile.business.name;
        document.getElementById('planBadge').textContent = userProfile.subscription.plan.toUpperCase() + ' PLAN';
    }
    
    localStorage.setItem('current_user', JSON.stringify(user));
    saveUserData();
    
    // Update avatar images
    updateProfileAvatars();
}

// Update Profile Avatars
function updateProfileAvatars() {
    const avatarUrl = userProfile.personal.profilePhoto || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.personal.name)}&background=00f7ff&color=050510&bold=true`;
    
    const avatarImg = document.getElementById('profileAvatar');
    const avatarLarge = document.getElementById('profileAvatarLarge');
    
    if (avatarImg) avatarImg.src = avatarUrl;
    if (avatarLarge) avatarLarge.src = avatarUrl;
}

// Toggle Profile Menu
function toggleProfileMenu() {
    const menu = document.querySelector('.profile-menu');
    menu.classList.toggle('show');
}

// Close Profile Menu
function closeProfileMenu() {
    const menu = document.querySelector('.profile-menu');
    menu.classList.remove('show');
}








 















// Create Profile Modal
function createProfileModal() {
    const modalHTML = `
    <div id="profileModal" class="modal">
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h2><i class="fas fa-user"></i> My Profile</h2>
                <button class="modal-close" onclick="closeModal('profileModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="profile-form-container">
                    <!-- Profile Photo Section -->
                    <div class="profile-photo-section">
                        <div class="profile-photo-container">
                            <img src="${userProfile.personal.profilePhoto || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userProfile.personal.name) + '&background=00f7ff&color=050510&bold=true'}" 
                                 alt="Profile Photo" id="profilePhotoPreview" class="profile-photo-preview">
                            <div class="profile-photo-actions">
                                <button class="btn btn-outline" onclick="openPhotoUpload()">
                                    <i class="fas fa-camera"></i> Change Photo
                                </button>
                                <input type="file" id="profilePhotoInput" accept="image/*" style="display: none;" onchange="handleProfilePhotoUpload(event)">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Personal Information -->
                    <div class="form-section-card">
                        <h3><i class="fas fa-id-card"></i> Personal Information</h3>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="profileName">Full Name *</label>
                                <input type="text" id="profileName" value="${userProfile.personal.name}" placeholder="Enter your full name">
                            </div>
                            <div class="form-group">
                                <label for="profileEmail">Email Address *</label>
                                <input type="email" id="profileEmail" value="${userProfile.personal.email}" placeholder="your@email.com">
                            </div>
                            <div class="form-group">
                                <label for="profilePhone">Phone Number *</label>
                                <input type="tel" id="profilePhone" value="${userProfile.personal.phone}" placeholder="+91 9876543210">
                            </div>
                            <div class="form-group full-width">
                                <label for="profileAddress">Address</label>
                                <textarea id="profileAddress" placeholder="Your complete address">${userProfile.personal.address}</textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Account Statistics -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-file-invoice"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number">${userProfile.invoices.length}</div>
                                <div class="stat-label">Total Invoices</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-rupee-sign"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number">₹${calculateTotalRevenue()}</div>
                                <div class="stat-label">Total Revenue</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number">${userProfile.customers.length}</div>
                                <div class="stat-label">Customers</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-calendar"></i>
                            </div>
                            <div class="stat-info">
                                <div class="stat-number">${getDaysSinceJoin()}</div>
                                <div class="stat-label">Days Active</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal('profileModal')">Cancel</button>
                <button class="btn btn-primary" onclick="saveProfile()">
                    <i class="fas fa-save"></i> Save Changes
                </button>
            </div>
        </div>
    </div>
    `;
    
    if (!document.getElementById('profileModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Calculate Total Revenue
function calculateTotalRevenue() {
    return userProfile.invoices.reduce((total, invoice) => {
        return total + (parseFloat(invoice.total) || 0);
    }, 0).toFixed(2);
}

// Get Days Since Join
function getDaysSinceJoin() {
    const joinDate = new Date(JSON.parse(localStorage.getItem('current_user')).createdAt || new Date());
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Save Profile Function
function saveProfile() {
    userProfile.personal.name = document.getElementById('profileName').value;
    userProfile.personal.email = document.getElementById('profileEmail').value;
    userProfile.personal.phone = document.getElementById('profilePhone').value;
    userProfile.personal.address = document.getElementById('profileAddress').value;
    
    // Update UI
    document.getElementById('userNameDisplay').textContent = userProfile.personal.name;
    document.getElementById('profileUserName').textContent = userProfile.personal.name;
    
    saveUserData();
    updateProfileAvatars();
    
    showNotification('Profile updated successfully!', 'success');
    closeModal('profileModal');
}

// Handle Profile Photo Upload
function openPhotoUpload() {
    document.getElementById('profilePhotoInput').click();
}

function handleProfilePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            userProfile.personal.profilePhoto = e.target.result;
            document.getElementById('profilePhotoPreview').src = e.target.result;
            updateProfileAvatars();
            saveUserData();
            showNotification('Profile photo updated!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Open Profile Modal
function openProfileModal() {
    // Refresh stats before opening
    document.querySelectorAll('.stat-number')[0].textContent = userProfile.invoices.length;
    document.querySelectorAll('.stat-number')[1].textContent = '₹' + calculateTotalRevenue();
    document.querySelectorAll('.stat-number')[2].textContent = userProfile.customers.length;
    document.querySelectorAll('.stat-number')[3].textContent = getDaysSinceJoin();
    
    openModal('profileModal');
}

// Add this to your existing modal open/close functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    initProfileSystem();
});

















// ==================== PROFESSIONAL INVOICE HISTORY ====================

// Create Invoice History Modal
function createInvoiceHistoryModal() {
    const modalHTML = `
    <div id="invoiceHistoryModal" class="modal">
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h2><i class="fas fa-file-invoice"></i> Invoice History</h2>
                <button class="modal-close" onclick="closeModal('invoiceHistoryModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="invoice-history-container">
                    <!-- Stats -->
                    <div class="history-stats">
                        <div class="stat-card">
                            <div class="stat-icon">📄</div>
                            <div class="stat-info">
                                <div class="stat-number" id="totalInvoices">0</div>
                                <div class="stat-label">Total Invoices</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-info">
                                <div class="stat-number" id="totalRevenue">₹0</div>
                                <div class="stat-label">Total Revenue</div>
                            </div>
                        </div>
                    </div>

                    <!-- Invoices List -->
                    <div class="invoices-list" id="invoicesList">
                        <!-- Invoices will load here -->
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    if (!document.getElementById('invoiceHistoryModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Open Invoice History
function openInvoiceHistory() {
    loadInvoiceHistory();
    openModal('invoiceHistoryModal');
}

// Load Invoice History
function loadInvoiceHistory() {
    // Try new payment data first, then fallback to old data
    const paymentData = JSON.parse(localStorage.getItem('sparkinvoice_payments') || '{"customers":[]}');
    const oldInvoices = JSON.parse(localStorage.getItem('sparkinvoice_invoices') || '[]');
    
    const invoices = paymentData.customers && paymentData.customers.length > 0 
        ? paymentData.customers 
        : oldInvoices;
    
    // Update stats
    document.getElementById('totalInvoices').textContent = invoices.length;
    
    const totalRevenue = invoices.reduce((sum, invoice) => {
        return sum + (parseFloat(invoice.total.replace('₹', '')) || 0);
    }, 0);
    document.getElementById('totalRevenue').textContent = '₹' + totalRevenue.toFixed(2);
    
    // Render invoices
    const container = document.getElementById('invoicesList');
    
    if (invoices.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No Invoices Yet</h3>
                <p>Create your first invoice to see it here</p>
                <button class="btn btn-primary" onclick="closeModal('invoiceHistoryModal'); scrollToSection('generator')">
                    Create First Invoice
                </button>
            </div>
        `;
        return;
    }
    
    let invoicesHTML = '';
    
    invoices.forEach(invoice => {
        const date = new Date(invoice.createdAt);
        const dateStr = date.toLocaleDateString('en-IN');
        const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        
        invoicesHTML += `
            <div class="invoice-card">
                <div class="invoice-header">
                    <div class="invoice-number">${invoice.number}</div>
                    <div class="invoice-date">${dateStr} • ${timeStr}</div>
                </div>
                
                <div class="invoice-body">
                    <div class="customer-info">
                        <div class="customer-avatar">
                            ${invoice.customer.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div class="customer-details">
                            <div class="customer-name">${invoice.customer}</div>
                            <div class="business-name">${invoice.business}</div>
                        </div>
                    </div>
                    
                    <div class="invoice-amount">
                        <div class="amount">${invoice.total}</div>
                        <div class="payment-method">${invoice.paymentMethod || 'cash'}</div>
                    </div>
                </div>
                
                <div class="invoice-footer">
                    <button class="btn btn-outline" onclick="viewInvoice('${invoice.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-primary" onclick="downloadInvoiceAgain('${invoice.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = invoicesHTML;
}

// View Invoice
function viewInvoice(invoiceId) {
    showNotification('View invoice feature coming soon!', 'info');
}

// Download Invoice Again
function downloadInvoiceAgain(invoiceId) {
    showNotification('Downloading invoice...', 'info');
}



















// ==================== PROFESSIONAL PAYMENT HISTORY ====================

// Create Payment History Modal
function createPaymentHistoryModal() {
    const modalHTML = `
    <div id="paymentHistoryModal" class="modal">
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h2><i class="fas fa-rupee-sign"></i> Payment History</h2>
                <button class="modal-close" onclick="closeModal('paymentHistoryModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="payment-history-container">
                    <!-- Payment Stats -->
                    <div class="payment-stats">
                        <div class="payment-stat-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-info">
                                <div class="stat-number" id="totalPayments">₹0</div>
                                <div class="stat-label">Total Received</div>
                            </div>
                        </div>
                        <div class="payment-stat-card">
                            <div class="stat-icon">📱</div>
                            <div class="stat-info">
                                <div class="stat-number" id="upiPayments">₹0</div>
                                <div class="stat-label">UPI Payments</div>
                            </div>
                        </div>
                        <div class="payment-stat-card">
                            <div class="stat-icon">💵</div>
                            <div class="stat-info">
                                <div class="stat-number" id="cashPayments">₹0</div>
                                <div class="stat-label">Cash Payments</div>
                            </div>
                        </div>
                    </div>

                    <!-- Payments List -->
                    <div class="payments-list" id="paymentsList">
                        <!-- Payments will load here -->
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    if (!document.getElementById('paymentHistoryModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Open Payment History
function openPaymentHistory() {
    loadPaymentHistory();
    openModal('paymentHistoryModal');
}

// Load Payment History
function loadPaymentHistory() {
    // Try new payment data first, then fallback to old data
    const paymentData = JSON.parse(localStorage.getItem('sparkinvoice_payments') || '{"customers":[]}');
    const oldInvoices = JSON.parse(localStorage.getItem('sparkinvoice_invoices') || '[]');
    
    const invoices = paymentData.customers && paymentData.customers.length > 0 
        ? paymentData.customers 
        : oldInvoices;
    
    // Calculate payment stats
    let total = 0;
    let upiTotal = 0;
    let cashTotal = 0;
    
    invoices.forEach(invoice => {
        const amount = parseFloat(invoice.total.replace('₹', '')) || 0;
        total += amount;
        
        if (invoice.paymentMethod === 'upi') {
            upiTotal += amount;
        } else {
            cashTotal += amount;
        }
    });
    
    // Update stats
    document.getElementById('totalPayments').textContent = '₹' + total.toFixed(2);
    document.getElementById('upiPayments').textContent = '₹' + upiTotal.toFixed(2);
    document.getElementById('cashPayments').textContent = '₹' + cashTotal.toFixed(2);
    
    // Render payments
    const container = document.getElementById('paymentsList');
    
    if (invoices.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💸</div>
                <h3>No Payments Yet</h3>
                <p>Payments will appear here after creating invoices</p>
            </div>
        `;
        return;
    }
    
    let paymentsHTML = '';
    
    invoices.forEach(invoice => {
        const date = new Date(invoice.createdAt);
        const dateStr = date.toLocaleDateString('en-IN');
        
        paymentsHTML += `
            <div class="payment-card">
                <div class="payment-header">
                    <div class="payment-info">
                        <div class="invoice-number">${invoice.number}</div>
                        <div class="payment-date">${dateStr}</div>
                    </div>
                    <div class="payment-amount">
                        ${invoice.total}
                    </div>
                </div>
                
                <div class="payment-body">
                    <div class="customer-name">
                        <i class="fas fa-user"></i> ${invoice.customer}
                    </div>
                    <div class="payment-method">
                        <i class="fas fa-wallet"></i> ${invoice.paymentMethod || 'cash'}
                    </div>
                </div>
                
                <div class="payment-status">
                    <span class="status-badge paid">PAID</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = paymentsHTML;
}












// ==================== CUSTOMER LOAN & HISTORY MANAGEMENT SYSTEM ====================

// Loan Data Structure
let loanCustomers = JSON.parse(localStorage.getItem('sparkinvoice_loans') || '[]');

// Create Loan Management Modal
function createLoanManagementModal() {
    const modalHTML = `
    <div id="loanManagementModal" class="modal">
        <div class="modal-content xxlarge-modal">
            <div class="modal-header">
                <h2><i class="fas fa-hand-holding-usd"></i> Customer Loan Management</h2>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="addNewCustomer()">
                        <i class="fas fa-user-plus"></i> Add Customer
                    </button>
                    <button class="modal-close" onclick="closeModal('loanManagementModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="modal-body">
                <div class="loan-management-container">
                    <!-- Tabs -->
                    <div class="loan-tabs">
                        <button class="loan-tab active" onclick="switchLoanTab('loan-account')">
                            <i class="fas fa-file-invoice-dollar"></i>
                            Loan Accounts
                        </button>
                        <button class="loan-tab" onclick="switchLoanTab('customer-history')">
                            <i class="fas fa-history"></i>
                            Customer History
                        </button>
                    </div>

                    <!-- Search & Filters -->
                    <div class="loan-filters">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="loanSearch" placeholder="Search customers by name, mobile or ID..." onkeyup="filterLoanCustomers()">
                        </div>
                        <div class="filter-group">
                            <select id="statusFilter" onchange="filterLoanCustomers()">
                                <option value="all">All Status</option>
                                <option value="active">Active Loans</option>
                                <option value="cleared">Cleared</option>
                            </select>
                            <select id="dateFilter" onchange="filterLoanCustomers()">
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                    </div>

                    <!-- Stats Overview -->
                    <div class="loan-stats-grid">
                        <div class="loan-stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number" id="totalCustomers">0</div>
                                <div class="stat-label">Total Customers</div>
                            </div>
                        </div>
                        <div class="loan-stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-rupee-sign"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number" id="totalLoanAmount">₹0</div>
                                <div class="stat-label">Total Loan Given</div>
                            </div>
                        </div>
                        <div class="loan-stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-wallet"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number" id="totalDeposited">₹0</div>
                                <div class="stat-label">Total Deposited</div>
                            </div>
                        </div>
                        <div class="loan-stat-card">
                            <div class="stat-icon">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-content">
                                <div class="stat-number" id="pendingBalance">₹0</div>
                                <div class="stat-label">Pending Balance</div>
                            </div>
                        </div>
                    </div>

                    <!-- Loan Account Tab Content -->
                    <div id="loan-account-tab" class="loan-tab-content active">
                        <div class="customers-grid" id="loanCustomersGrid">
                            <!-- Loan customers will be loaded here -->
                        </div>
                    </div>

                    <!-- Customer History Tab Content -->
                    <div id="customer-history-tab" class="loan-tab-content">
                        <div class="history-container">
                            <div class="history-filters">
                                <input type="date" id="historyDate" onchange="loadCustomerHistory()">
                                <button class="btn btn-outline" onclick="loadCustomerHistory()">
                                    <i class="fas fa-sync"></i> Refresh
                                </button>
                            </div>
                            <div class="history-summary">
                                <div class="summary-card">
                                    <div class="summary-title">Today's Summary</div>
                                    <div class="summary-stats">
                                        <div class="summary-stat">
                                            <span class="stat-value" id="todayBills">0</span>
                                            <span class="stat-label">Total Bills</span>
                                        </div>
                                        <div class="summary-stat">
                                            <span class="stat-value" id="todaySales">₹0</span>
                                            <span class="stat-label">Total Sales</span>
                                        </div>
                                        <div class="summary-stat">
                                            <span class="stat-value" id="todayReceived">₹0</span>
                                            <span class="stat-label">Received</span>
                                        </div>
                                        <div class="summary-stat">
                                            <span class="stat-value" id="todayPending">₹0</span>
                                            <span class="stat-label">Pending</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="history-table-container">
                                <table class="history-table">
                                    <thead>
                                        <tr>
                                            <th>Customer</th>
                                            <th>Date & Time</th>
                                            <th>Items</th>
                                            <th>Invoice Amount</th>
                                            <th>Payment</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="historyTableBody">
                                        <!-- History data will be loaded here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    if (!document.getElementById('loanManagementModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Switch between tabs
function switchLoanTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.loan-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.loan-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked tab
    event.currentTarget.classList.add('active');
    
    // Load data for the tab
    if (tabName === 'loan-account') {
        loadLoanCustomers();
    } else if (tabName === 'customer-history') {
        loadCustomerHistory();
    }
}

// Load Loan Customers
function loadLoanCustomers() {
    updateLoanStats();
    
    const container = document.getElementById('loanCustomersGrid');
    
    if (loanCustomers.length === 0) {
        container.innerHTML = `
            <div class="empty-loan-state">
                <div class="empty-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3>No Loan Customers Yet</h3>
                <p>Add customers to start tracking loans and deposits</p>
                <button class="btn btn-primary" onclick="addNewCustomer()">
                    <i class="fas fa-user-plus"></i> Add First Customer
                </button>
            </div>
        `;
        return;
    }
    
    let customersHTML = '';
    
    loanCustomers.forEach(customer => {
        const statusClass = customer.balance > 0 ? 'active' : 'cleared';
        const statusText = customer.balance > 0 ? 'Active' : 'Cleared';
        
        customersHTML += `
            <div class="customer-loan-card" data-customer-id="${customer.id}">
                <div class="customer-header">
                    <div class="customer-avatar">
                        ${customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div class="customer-info">
                        <div class="customer-name">${customer.name}</div>
                        <div class="customer-mobile">📱 ${customer.mobile}</div>
                        <div class="customer-id">ID: ${customer.id}</div>
                    </div>
                    <div class="customer-status ${statusClass}">${statusText}</div>
                </div>
                
                <div class="loan-summary">
                    <div class="summary-item">
                        <div class="summary-label">Total Loan</div>
                        <div class="summary-value">₹${customer.totalLoan.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Total Deposited</div>
                        <div class="summary-value">₹${customer.totalDeposited.toFixed(2)}</div>
                    </div>
                    <div class="summary-item balance">
                        <div class="summary-label">Current Balance</div>
                        <div class="summary-value">₹${customer.balance.toFixed(2)}</div>
                    </div>
                </div>
                
                <div class="transaction-timeline">
                    <div class="timeline-header">
                        <span>Recent Transactions</span>
                        <button class="btn-text" onclick="viewAllTransactions('${customer.id}')">View All</button>
                    </div>
                    <div class="timeline-list">
                        ${customer.transactions.slice(0, 3).map(transaction => `
                            <div class="timeline-item">
                                <div class="timeline-date">${formatDateTime(transaction.date)}</div>
                                <div class="timeline-type ${transaction.type}">
                                    ${transaction.type === 'loan' ? '📥 Loan' : '📤 Deposit'}
                                </div>
                                <div class="timeline-amount">₹${transaction.amount.toFixed(2)}</div>
                                <div class="timeline-balance">₹${transaction.balance.toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="customer-actions">
                    <button class="btn btn-outline" onclick="addLoanTransaction('${customer.id}')">
                        <i class="fas fa-plus"></i> Add Loan
                    </button>
                    <button class="btn btn-primary" onclick="addDepositTransaction('${customer.id}')">
                        <i class="fas fa-rupee-sign"></i> Add Deposit
                    </button>
                    <button class="btn btn-secondary" onclick="viewCustomerDetails('${customer.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = customersHTML;
}

// Update Loan Statistics
function updateLoanStats() {
    const totalCustomers = loanCustomers.length;
    const totalLoanAmount = loanCustomers.reduce((sum, customer) => sum + customer.totalLoan, 0);
    const totalDeposited = loanCustomers.reduce((sum, customer) => sum + customer.totalDeposited, 0);
    const pendingBalance = loanCustomers.reduce((sum, customer) => sum + customer.balance, 0);
    
    document.getElementById('totalCustomers').textContent = totalCustomers;
    document.getElementById('totalLoanAmount').textContent = '₹' + totalLoanAmount.toFixed(2);
    document.getElementById('totalDeposited').textContent = '₹' + totalDeposited.toFixed(2);
    document.getElementById('pendingBalance').textContent = '₹' + pendingBalance.toFixed(2);
}

// Add New Customer
function addNewCustomer() {
    const customerName = prompt('Enter customer name:');
    if (!customerName) return;
    
    const customerMobile = prompt('Enter customer mobile number:');
    if (!customerMobile) return;
    
    const newCustomer = {
        id: 'CUST-' + Date.now(),
        name: customerName,
        mobile: customerMobile,
        totalLoan: 0,
        totalDeposited: 0,
        balance: 0,
        transactions: [],
        createdAt: new Date().toISOString()
    };
    
    loanCustomers.unshift(newCustomer);
    saveLoanData();
    loadLoanCustomers();
    
    showNotification(`Customer ${customerName} added successfully!`, 'success');
}

// Add Loan Transaction
function addLoanTransaction(customerId) {
    const customer = loanCustomers.find(c => c.id === customerId);
    if (!customer) return;
    
    const amount = parseFloat(prompt(`Enter loan amount for ${customer.name}:`));
    if (!amount || amount <= 0) return;
    
    const transaction = {
        id: 'TXN-' + Date.now(),
        type: 'loan',
        amount: amount,
        date: new Date().toISOString(),
        balance: customer.balance + amount
    };
    
    customer.transactions.unshift(transaction);
    customer.totalLoan += amount;
    customer.balance += amount;
    
    saveLoanData();
    loadLoanCustomers();
    
    showNotification(`Loan of ₹${amount} added for ${customer.name}`, 'success');
}

// Add Deposit Transaction
function addDepositTransaction(customerId) {
    const customer = loanCustomers.find(c => c.id === customerId);
    if (!customer) return;
    
    const amount = parseFloat(prompt(`Enter deposit amount for ${customer.name} (Current balance: ₹${customer.balance}):`));
    if (!amount || amount <= 0) return;
    
    if (amount > customer.balance) {
        showNotification('Deposit amount cannot exceed current balance!', 'error');
        return;
    }
    
    const transaction = {
        id: 'TXN-' + Date.now(),
        type: 'deposit',
        amount: amount,
        date: new Date().toISOString(),
        balance: customer.balance - amount
    };
    
    customer.transactions.unshift(transaction);
    customer.totalDeposited += amount;
    customer.balance -= amount;
    
    saveLoanData();
    loadLoanCustomers();
    
    showNotification(`Deposit of ₹${amount} received from ${customer.name}`, 'success');
}

// Load Customer History - FIXED VERSION
function loadCustomerHistory() {
    // Load from NEW payment data
    const paymentData = JSON.parse(localStorage.getItem('sparkinvoice_payments') || '{"customers":[]}');
    const oldInvoices = JSON.parse(localStorage.getItem('sparkinvoice_invoices') || '[]');
    const loanCustomers = JSON.parse(localStorage.getItem('sparkinvoice_loans') || '[]');
    
    // Combine data - NEW system priority
    const invoices = paymentData.customers && paymentData.customers.length > 0 
        ? paymentData.customers 
        : oldInvoices;
    
    updateCustomerStats(invoices);
    renderCustomerHistory(invoices, loanCustomers);
}

// Update Customer Statistics - FIXED
function updateCustomerStats(invoices) {
    const totalCustomers = [...new Set(invoices.map(inv => inv.customer))].length;
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => {
        if (inv.amountValue) {
            return sum + inv.amountValue; // NEW system
        } else if (inv.amount) {
            return sum + parseFloat(inv.amount.replace('₹', '') || 0); // NEW system
        } else if (inv.total) {
            return sum + parseFloat(inv.total.replace('₹', '') || 0); // OLD system
        }
        return sum;
    }, 0);
    
    const today = new Date().toDateString();
    const todayInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.timestamp || inv.createdAt).toDateString();
        return invDate === today;
    });
    
    document.getElementById('totalCustomersCount').textContent = totalCustomers;
    document.getElementById('totalInvoicesCount').textContent = totalInvoices;
    document.getElementById('totalRevenueCount').textContent = '₹' + totalRevenue.toFixed(2);
    document.getElementById('todayInvoicesCount').textContent = todayInvoices.length;
}

// Render Customer History Table - FIXED
function renderCustomerHistory(invoices, loanCustomers) {
    const tableBody = document.getElementById('customerHistoryBody');
    
    if (invoices.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-table">
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No Customer Data Found</h3>
                        <p>Create invoices to see customer history here</p>
                    </div>
                </td>
            </tr>
        `;
        updateSummary(0, 0, 0);
        return;
    }
    
    let tableHTML = '';
    let customerMap = new Map();
    
    // Process all invoices
    invoices.forEach(invoice => {
        const customerKey = invoice.customer + (invoice.phone || '');
        if (!customerMap.has(customerKey)) {
            customerMap.set(customerKey, {
                customer: invoice.customer,
                phone: invoice.phone || 'N/A',
                invoices: [],
                totalAmount: 0,
                firstSeen: invoice.timestamp || invoice.createdAt,
                lastSeen: invoice.timestamp || invoice.createdAt
            });
        }
        
        const customerData = customerMap.get(customerKey);
        customerData.invoices.push(invoice);
        
        // Calculate amount from different data structures
        const amount = invoice.amountValue || 
                      parseFloat(invoice.amount?.replace('₹', '') || 0) || 
                      parseFloat(invoice.total?.replace('₹', '') || 0);
        
        customerData.totalAmount += amount;
        
        const invoiceDate = new Date(invoice.timestamp || invoice.createdAt);
        const firstSeenDate = new Date(customerData.firstSeen);
        const lastSeenDate = new Date(customerData.lastSeen);
        
        if (invoiceDate < firstSeenDate) {
            customerData.firstSeen = invoice.timestamp || invoice.createdAt;
        }
        if (invoiceDate > lastSeenDate) {
            customerData.lastSeen = invoice.timestamp || invoice.createdAt;
        }
    });
    
    // Convert map to array and sort by last seen date
    const customersArray = Array.from(customerMap.values()).sort((a, b) => 
        new Date(b.lastSeen) - new Date(a.lastSeen)
    );
    
    // Generate table rows
    customersArray.forEach(customer => {
        const latestInvoice = customer.invoices[0]; // Most recent invoice
        const date = new Date(latestInvoice.timestamp || latestInvoice.createdAt);
        const dateStr = date.toLocaleDateString('en-IN');
        const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        
        // Check if customer has loan
        const hasLoan = loanCustomers.some(loanCust => 
            loanCust.name === customer.customer || loanCust.mobile === customer.phone
        );
        
        // Get items preview (handle different data structures)
        const items = latestInvoice.items || [];
        const itemsPreview = items.slice(0, 2).map(item => 
            item.description || item.name || 'Item'
        ).join(', ') + (items.length > 2 ? ` +${items.length - 2} more` : '');
        
        // Get invoice number from different structures
        const invoiceNumber = latestInvoice.id || latestInvoice.number || 'INV-001';
        
        // Get payment method
        const paymentMethod = latestInvoice.paymentMode || latestInvoice.paymentMethod || 'cash';
        
        // Get total amount for this invoice
        const invoiceAmount = latestInvoice.amount || latestInvoice.total || '₹0';
        
        tableHTML += `
            <tr class="customer-row">
                <td>
                    <div class="customer-cell-detailed">
                        <div class="customer-avatar-medium">
                            ${customer.customer.split(' ').map(n => n[0]).join('').toUpperCase()}
                            ${hasLoan ? '<span class="loan-indicator" title="Has Loan Account">💰</span>' : ''}
                        </div>
                        <div class="customer-details">
                            <div class="customer-name">${customer.customer}</div>
                            <div class="customer-stats">
                                <span class="invoice-count">${customer.invoices.length} bills</span>
                                <span class="total-spent">₹${customer.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="contact-cell">
                        <div class="phone-number">${customer.phone}</div>
                        <div class="customer-since">Since ${new Date(customer.firstSeen).toLocaleDateString('en-IN')}</div>
                    </div>
                </td>
                <td>
                    <div class="invoice-cell">
                        <div class="invoice-number">${invoiceNumber}</div>
                        <div class="invoice-type">${latestInvoice.template || 'Standard'}</div>
                    </div>
                </td>
                <td>
                    <div class="datetime-cell-detailed">
                        <div class="date">${dateStr}</div>
                        <div class="time">${timeStr}</div>
                        <div class="days-ago">${getDaysAgo(latestInvoice.timestamp || latestInvoice.createdAt)}</div>
                    </div>
                </td>
                <td>
                    <div class="items-cell-detailed" title="${items.map(item => item.description || item.name || 'Item').join(', ')}">
                        ${itemsPreview || 'No items'}
                    </div>
                </td>
                <td>
                    <div class="amount-cell-detailed">
                        <div class="invoice-amount">${invoiceAmount}</div>
                        <div class="customer-total">Total: ₹${customer.totalAmount.toFixed(2)}</div>
                    </div>
                </td>
                <td>
                    <div class="payment-cell-detailed">
                        <span class="payment-method ${paymentMethod}">
                            ${paymentMethod}
                        </span>
                        <div class="payment-status paid">Paid</div>
                    </div>
                </td>
                <td>
                    <div class="actions-cell-detailed">
                        <button class="btn-icon-small" onclick="viewCustomerInvoices('${customer.customer}')" title="View All Invoices">
                            <i class="fas fa-list"></i>
                        </button>
                        <button class="btn-icon-small" onclick="downloadCustomerInvoice('${latestInvoice.id || ''}')" title="Download Invoice">
                            <i class="fas fa-download"></i>
                        </button>
                        ${!hasLoan ? `
                        <button class="btn-icon-small" onclick="addToLoanCustomers('${customer.customer}', '${customer.phone}')" title="Add to Loan Customers">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                        ` : ''}
                        <button class="btn-icon-small" onclick="contactCustomer('${customer.phone}')" title="Contact Customer">
                            <i class="fas fa-phone"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
    updateSummary(customersArray.length, invoices.length, 
        customersArray.reduce((sum, cust) => sum + cust.totalAmount, 0));
}

// Utility Functions
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN') + ' ' + date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', minute: '2-digit' 
    });
}

function saveLoanData() {
    localStorage.setItem('sparkinvoice_loans', JSON.stringify(loanCustomers));
}

function filterLoanCustomers() {
    // Implementation for filtering
    loadLoanCustomers();
}

// Open Loan Management
function openLoanManagement() {
    loadLoanCustomers();
    openModal('loanManagementModal');
}

// Initialize in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    createLoanManagementModal();
});













// ==================== COMPLETE CUSTOMER HISTORY SYSTEM ====================
// Create Customer History Modal
function createCustomerHistoryModal() {
    const modalHTML = `
    <div id="customerHistoryModal" class="modal">
        <div class="modal-content xxlarge-modal">
            <div class="modal-header">
                <h2><i class="fas fa-users"></i> Complete Customer History</h2>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="exportCustomerData()">
                        <i class="fas fa-download"></i> Export Data
                    </button>
                    <button class="modal-close" onclick="closeModal('customerHistoryModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="modal-body">
                <div class="customer-history-container">
                    <!-- Quick Stats -->
                    <div class="quick-stats-grid">
                        <div class="quick-stat-card">
                            <div class="quick-stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="quick-stat-content">
                                <div class="quick-stat-number" id="totalCustomersCount">0</div>
                                <div class="quick-stat-label">Total Customers</div>
                            </div>
                        </div>
                        <div class="quick-stat-card">
                            <div class="quick-stat-icon">
                                <i class="fas fa-file-invoice"></i>
                            </div>
                            <div class="quick-stat-content">
                                <div class="quick-stat-number" id="totalInvoicesCount">0</div>
                                <div class="quick-stat-label">Total Invoices</div>
                            </div>
                        </div>
                        <div class="quick-stat-card">
                            <div class="quick-stat-icon">
                                <i class="fas fa-rupee-sign"></i>
                            </div>
                            <div class="quick-stat-content">
                                <div class="quick-stat-number" id="totalRevenueCount">₹0</div>
                                <div class="quick-stat-label">Total Revenue</div>
                            </div>
                        </div>
                        <div class="quick-stat-card">
                            <div class="quick-stat-icon">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                            <div class="quick-stat-content">
                                <div class="quick-stat-number" id="todayInvoicesCount">0</div>
                                <div class="quick-stat-label">Today's Invoices</div>
                            </div>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div class="customer-filters">
                        <div class="filter-group">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" id="customerSearch" placeholder="Search customers by name, mobile, invoice..." onkeyup="filterCustomerHistory()">
                            </div>
                            <select id="timeFilter" onchange="filterCustomerHistory()">
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="custom">Custom Date</option>
                            </select>
                            <select id="paymentFilter" onchange="filterCustomerHistory()">
                                <option value="all">All Payments</option>
                                <option value="cash">Cash</option>
                                <option value="upi">UPI</option>
                                <option value="card">Card</option>
                            </select>
                            <button class="btn btn-outline" onclick="resetFilters()">
                                <i class="fas fa-refresh"></i> Reset
                            </button>
                        </div>
                        <div class="date-range-filter" id="dateRangeFilter" style="display: none;">
                            <input type="date" id="startDate" onchange="filterCustomerHistory()">
                            <span>to</span>
                            <input type="date" id="endDate" onchange="filterCustomerHistory()">
                        </div>
                    </div>

                    <!-- Customer History Table -->
                    <div class="customer-table-container">
                        <table class="customer-history-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Contact</th>
                                    <th>Invoice Details</th>
                                    <th>Date & Time</th>
                                    <th>Items</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="customerHistoryBody">
                                <!-- Customer data will load here -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Summary Section -->
                    <div class="customer-summary">
                        <div class="summary-card">
                            <h4>📊 Period Summary</h4>
                            <div class="summary-grid">
                                <div class="summary-item">
                                    <span class="summary-label">Total Customers:</span>
                                    <span class="summary-value" id="summaryCustomers">0</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Total Invoices:</span>
                                    <span class="summary-value" id="summaryInvoices">0</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Total Amount:</span>
                                    <span class="summary-value" id="summaryAmount">₹0</span>
                                </div>
                                <div class="summary-item">
                                    <span class="summary-label">Average Bill:</span>
                                    <span class="summary-value" id="summaryAverage">₹0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    if (!document.getElementById('customerHistoryModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Load Customer History - FIXED COMBINED VERSION
function loadCustomerHistory() {
    // Load from BOTH systems
    const paymentData = JSON.parse(localStorage.getItem('sparkinvoice_payments') || '{"customers":[]}');
    const oldInvoices = JSON.parse(localStorage.getItem('sparkinvoice_invoices') || '[]');
    const loanCustomers = JSON.parse(localStorage.getItem('sparkinvoice_loans') || '[]');
    
    // Combine data - NEW system has priority
    const invoices = paymentData.customers && paymentData.customers.length > 0 
        ? paymentData.customers 
        : oldInvoices;
    
    updateCustomerStats(invoices);
    renderCustomerHistory(invoices, loanCustomers);
}

// Update Customer Statistics - FIXED
function updateCustomerStats(invoices) {
    const totalCustomers = [...new Set(invoices.map(inv => inv.customer))].length;
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => {
        if (inv.amountValue) {
            return sum + inv.amountValue; // NEW system
        } else if (inv.amount) {
            return sum + parseFloat(inv.amount.replace('₹', '') || 0); // NEW system
        } else if (inv.total) {
            return sum + parseFloat(inv.total.replace('₹', '') || 0); // OLD system
        }
        return sum;
    }, 0);
    
    const today = new Date().toDateString();
    const todayInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.timestamp || inv.createdAt).toDateString();
        return invDate === today;
    });
    
    document.getElementById('totalCustomersCount').textContent = totalCustomers;
    document.getElementById('totalInvoicesCount').textContent = totalInvoices;
    document.getElementById('totalRevenueCount').textContent = '₹' + totalRevenue.toFixed(2);
    document.getElementById('todayInvoicesCount').textContent = todayInvoices.length;
}

// Render Customer History Table - FIXED
function renderCustomerHistory(invoices, loanCustomers) {
    const tableBody = document.getElementById('customerHistoryBody');
    
    if (invoices.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-table">
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No Customer Data Found</h3>
                        <p>Create invoices to see customer history here</p>
                    </div>
                </td>
            </tr>
        `;
        updateSummary(0, 0, 0);
        return;
    }
    
    let tableHTML = '';
    let customerMap = new Map();
    
    // Process all invoices
    invoices.forEach(invoice => {
        const customerKey = invoice.customer + (invoice.phone || '');
        if (!customerMap.has(customerKey)) {
            customerMap.set(customerKey, {
                customer: invoice.customer,
                phone: invoice.phone || 'N/A',
                invoices: [],
                totalAmount: 0,
                firstSeen: invoice.timestamp || invoice.createdAt,
                lastSeen: invoice.timestamp || invoice.createdAt
            });
        }
        
        const customerData = customerMap.get(customerKey);
        customerData.invoices.push(invoice);
        
        // Calculate amount from different data structures
        const amount = invoice.amountValue || 
                      parseFloat(invoice.amount?.replace('₹', '') || 0) || 
                      parseFloat(invoice.total?.replace('₹', '') || 0);
        
        customerData.totalAmount += amount;
        
        const invoiceDate = new Date(invoice.timestamp || invoice.createdAt);
        const firstSeenDate = new Date(customerData.firstSeen);
        const lastSeenDate = new Date(customerData.lastSeen);
        
        if (invoiceDate < firstSeenDate) {
            customerData.firstSeen = invoice.timestamp || invoice.createdAt;
        }
        if (invoiceDate > lastSeenDate) {
            customerData.lastSeen = invoice.timestamp || invoice.createdAt;
        }
    });
    
    // Convert map to array and sort by last seen date
    const customersArray = Array.from(customerMap.values()).sort((a, b) => 
        new Date(b.lastSeen) - new Date(a.lastSeen)
    );
    
    // Generate table rows
    customersArray.forEach(customer => {
        const latestInvoice = customer.invoices[0]; // Most recent invoice
        const date = new Date(latestInvoice.timestamp || latestInvoice.createdAt);
        const dateStr = date.toLocaleDateString('en-IN');
        const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        
        // Check if customer has loan
        const hasLoan = loanCustomers.some(loanCust => 
            loanCust.name === customer.customer || loanCust.mobile === customer.phone
        );
        
        // Get items preview (handle different data structures)
        const items = latestInvoice.items || [];
        const itemsPreview = items.slice(0, 2).map(item => 
            item.description || item.name || 'Item'
        ).join(', ') + (items.length > 2 ? ` +${items.length - 2} more` : '');
        
        // Get invoice number from different structures
        const invoiceNumber = latestInvoice.id || latestInvoice.number || 'INV-001';
        
        // Get payment method
        const paymentMethod = latestInvoice.paymentMode || latestInvoice.paymentMethod || 'cash';
        
        // Get total amount for this invoice
        const invoiceAmount = latestInvoice.amount || latestInvoice.total || '₹0';
        
        tableHTML += `
            <tr class="customer-row">
                <td>
                    <div class="customer-cell-detailed">
                        <div class="customer-avatar-medium">
                            ${customer.customer.split(' ').map(n => n[0]).join('').toUpperCase()}
                            ${hasLoan ? '<span class="loan-indicator" title="Has Loan Account">💰</span>' : ''}
                        </div>
                        <div class="customer-details">
                            <div class="customer-name">${customer.customer}</div>
                            <div class="customer-stats">
                                <span class="invoice-count">${customer.invoices.length} bills</span>
                                <span class="total-spent">₹${customer.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="contact-cell">
                        <div class="phone-number">${customer.phone}</div>
                        <div class="customer-since">Since ${new Date(customer.firstSeen).toLocaleDateString('en-IN')}</div>
                    </div>
                </td>
                <td>
                    <div class="invoice-cell">
                        <div class="invoice-number">${invoiceNumber}</div>
                        <div class="invoice-type">${latestInvoice.template || 'Standard'}</div>
                    </div>
                </td>
                <td>
                    <div class="datetime-cell-detailed">
                        <div class="date">${dateStr}</div>
                        <div class="time">${timeStr}</div>
                        <div class="days-ago">${getDaysAgo(latestInvoice.timestamp || latestInvoice.createdAt)}</div>
                    </div>
                </td>
                <td>
                    <div class="items-cell-detailed" title="${items.map(item => item.description || item.name || 'Item').join(', ')}">
                        ${itemsPreview || 'No items'}
                    </div>
                </td>
                <td>
                    <div class="amount-cell-detailed">
                        <div class="invoice-amount">${invoiceAmount}</div>
                        <div class="customer-total">Total: ₹${customer.totalAmount.toFixed(2)}</div>
                    </div>
                </td>
                <td>
                    <div class="payment-cell-detailed">
                        <span class="payment-method ${paymentMethod}">
                            ${paymentMethod}
                        </span>
                        <div class="payment-status paid">Paid</div>
                    </div>
                </td>
                <td>
                    <div class="actions-cell-detailed">
                        <button class="btn-icon-small" onclick="viewCustomerInvoices('${customer.customer}')" title="View All Invoices">
                            <i class="fas fa-list"></i>
                        </button>
                        <button class="btn-icon-small" onclick="downloadCustomerInvoice('${latestInvoice.id || ''}')" title="Download Invoice">
                            <i class="fas fa-download"></i>
                        </button>
                        ${!hasLoan ? `
                        <button class="btn-icon-small" onclick="addToLoanCustomers('${customer.customer}', '${customer.phone}')" title="Add to Loan Customers">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                        ` : ''}
                        <button class="btn-icon-small" onclick="contactCustomer('${customer.phone}')" title="Contact Customer">
                            <i class="fas fa-phone"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
    updateSummary(customersArray.length, invoices.length, 
        customersArray.reduce((sum, cust) => sum + cust.totalAmount, 0));
}

// Update Summary Section
function updateSummary(customerCount, invoiceCount, totalAmount) {
    document.getElementById('summaryCustomers').textContent = customerCount;
    document.getElementById('summaryInvoices').textContent = invoiceCount;
    document.getElementById('summaryAmount').textContent = '₹' + totalAmount.toFixed(2);
    document.getElementById('summaryAverage').textContent = invoiceCount > 0 ? 
        '₹' + (totalAmount / invoiceCount).toFixed(2) : '₹0';
}

// Helper function for days ago
function getDaysAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === 0) return 'Today';
    return `${diffDays} days ago`;
}

function filterCustomerHistory() {
    const timeFilter = document.getElementById('timeFilter').value;
    const paymentFilter = document.getElementById('paymentFilter').value;
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    
    // Show/hide date range filter
    const dateRangeFilter = document.getElementById('dateRangeFilter');
    dateRangeFilter.style.display = timeFilter === 'custom' ? 'flex' : 'none';
    
    loadCustomerHistory(); // Reload with filters (basic implementation)
}

function resetFilters() {
    document.getElementById('timeFilter').value = 'all';
    document.getElementById('paymentFilter').value = 'all';
    document.getElementById('customerSearch').value = '';
    document.getElementById('dateRangeFilter').style.display = 'none';
    loadCustomerHistory();
}

// Action Functions
function viewCustomerInvoices(customerName) {
    showNotification(`Loading all invoices for ${customerName}...`, 'info');
    // Implementation for viewing all customer invoices
}

function downloadCustomerInvoice(invoiceId) {
    showNotification('Downloading invoice...', 'info');
    // Implementation for downloading specific invoice
}

function addToLoanCustomers(customerName, phone) {
    if (confirm(`Add ${customerName} to loan customers?`)) {
        const newCustomer = {
            id: 'CUST-' + Date.now(),
            name: customerName,
            mobile: phone,
            totalLoan: 0,
            totalDeposited: 0,
            balance: 0,
            transactions: [],
            createdAt: new Date().toISOString()
        };
        
        const loanCustomers = JSON.parse(localStorage.getItem('sparkinvoice_loans') || '[]');
        loanCustomers.unshift(newCustomer);
        localStorage.setItem('sparkinvoice_loans', JSON.stringify(loanCustomers));
        
        showNotification(`${customerName} added to loan customers!`, 'success');
        loadCustomerHistory(); // Refresh the table
    }
}

function contactCustomer(phone) {
    if (phone && phone !== 'N/A') {
        window.open(`tel:${phone}`, '_self');
    } else {
        showNotification('Phone number not available', 'error');
    }
}

function exportCustomerData() {
    showNotification('Exporting customer data...', 'info');
    // Implementation for exporting data to CSV/Excel
}

// Open Customer History Modal
function openCustomerHistory() {
    createCustomerHistoryModal();
    loadCustomerHistory();
    openModal('customerHistoryModal');
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    createCustomerHistoryModal();
});













// ==================== BUSINESS DETAILS AUTO-FILL SYSTEM ====================

// Business Data Structure
let businessDetails = {
    name: '',
    phone: '',
    address: '',
    gst: '',
    upi: '',
    email: '',
    website: '',
    logo: '',
    autoFill: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

// Initialize Business System
function initBusinessSystem() {
    loadBusinessDetails();
}

// Load Business Details from Local Storage
function loadBusinessDetails() {
    const savedBusiness = localStorage.getItem('sparkinvoice_business');
    if (savedBusiness) {
        try {
            businessDetails = JSON.parse(savedBusiness);
            
            // Auto-fill current invoice if enabled
            if (businessDetails.autoFill) {
                setTimeout(() => {
                    autoFillBusinessDetails();
                }, 1000);
            }
        } catch (e) {
            console.error('Error loading business details:', e);
        }
    }
}

// Save Business Details to Local Storage
function saveBusinessDetails() {
    try {
        // Get values from form
        businessDetails.name = document.getElementById('businessName').value.trim();
        businessDetails.phone = document.getElementById('businessPhone').value.trim();
        businessDetails.address = document.getElementById('businessAddress').value.trim();
        businessDetails.gst = document.getElementById('businessGST').value.trim();
        businessDetails.upi = document.getElementById('businessUPI').value.trim();
        businessDetails.email = document.getElementById('businessEmail').value.trim();
        businessDetails.website = document.getElementById('businessWebsite').value.trim();
        businessDetails.autoFill = document.getElementById('autoFillToggle').checked;
        businessDetails.updatedAt = new Date().toISOString();

        // Validate required fields
        if (!businessDetails.name) {
            showNotification('Business Name is required!', 'error');
            return;
        }

        // Save to localStorage
        localStorage.setItem('sparkinvoice_business', JSON.stringify(businessDetails));
        
        // Update preview and auto-fill
        updateBusinessPreview();
        
        if (businessDetails.autoFill) {
            autoFillBusinessDetails();
        }
        
        showNotification('Business details saved successfully!', 'success');
        closeModal('businessModal');
    } catch (error) {
        showNotification('Error saving business details!', 'error');
        console.error('Save error:', error);
    }
}

// Update Business Form with Saved Data
function updateBusinessForm() {
    if (!document.getElementById('businessName')) return;
    
    try {
        document.getElementById('businessName').value = businessDetails.name || '';
        document.getElementById('businessPhone').value = businessDetails.phone || '';
        document.getElementById('businessAddress').value = businessDetails.address || '';
        document.getElementById('businessGST').value = businessDetails.gst || '';
        document.getElementById('businessUPI').value = businessDetails.upi || '';
        document.getElementById('businessEmail').value = businessDetails.email || '';
        document.getElementById('businessWebsite').value = businessDetails.website || '';
        document.getElementById('autoFillToggle').checked = businessDetails.autoFill !== false;
        
        // Update logo preview
        if (businessDetails.logo) {
            document.getElementById('businessLogoPreview').src = businessDetails.logo;
        }
    } catch (error) {
        console.error('Error updating business form:', error);
    }
}

// Update Business Preview
function updateBusinessPreview() {
    const previewContainer = document.getElementById('businessInfoPreview');
    if (!previewContainer) return;
    
    try {
        let previewHTML = '';
        
        if (businessDetails.name) {
            previewHTML += `
                <div class="business-info-item">
                    <div class="business-info-label">Business Name</div>
                    <div class="business-info-value">${businessDetails.name}</div>
                </div>
            `;
        }
        
        if (businessDetails.phone) {
            previewHTML += `
                <div class="business-info-item">
                    <div class="business-info-label">Contact</div>
                    <div class="business-info-value">${businessDetails.phone}</div>
                </div>
            `;
        }
        
        if (businessDetails.address) {
            previewHTML += `
                <div class="business-info-item">
                    <div class="business-info-label">Address</div>
                    <div class="business-info-value">${businessDetails.address}</div>
                </div>
            `;
        }
        
        if (businessDetails.gst) {
            previewHTML += `
                <div class="business-info-item">
                    <div class="business-info-label">GST Number</div>
                    <div class="business-info-value">${businessDetails.gst}</div>
                </div>
            `;
        }
        
        if (businessDetails.upi) {
            previewHTML += `
                <div class="business-info-item">
                    <div class="business-info-label">UPI ID</div>
                    <div class="business-info-value">${businessDetails.upi}</div>
                </div>
            `;
        }
        
        if (businessDetails.email) {
            previewHTML += `
                <div class="business-info-item">
                    <div class="business-info-label">Email</div>
                    <div class="business-info-value">${businessDetails.email}</div>
                </div>
            `;
        }
        
        if (businessDetails.website) {
            previewHTML += `
                <div class="business-info-item">
                    <div class="business-info-label">Website</div>
                    <div class="business-info-value">${businessDetails.website}</div>
                </div>
            `;
        }
        
        previewContainer.innerHTML = previewHTML || `
            <div class="business-info-item full-width">
                <div class="business-info-value" style="text-align: center; opacity: 0.7;">
                    No business details saved yet
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error updating business preview:', error);
    }
}

// Auto-fill Business Details in Invoice Form
function autoFillBusinessDetails() {
    if (!businessDetails.autoFill) return;
    
    try {
        // Fill invoice form fields
        if (businessDetails.name && document.getElementById('userName')) {
            document.getElementById('userName').value = businessDetails.name;
        }
        
        if (businessDetails.address && document.getElementById('businessAddress')) {
            document.getElementById('businessAddress').value = businessDetails.address;
        }
        
        if (businessDetails.phone && document.getElementById('contactNumber')) {
            document.getElementById('contactNumber').value = businessDetails.phone;
        }
        
        if (businessDetails.gst && document.getElementById('gstNumber')) {
            document.getElementById('gstNumber').value = businessDetails.gst;
        }
        
        if (businessDetails.upi && document.getElementById('upiId')) {
            document.getElementById('upiId').value = businessDetails.upi;
        }
        
        // Update invoice preview
        if (typeof updateInvoicePreview === 'function') {
            updateInvoicePreview();
        }
    } catch (error) {
        console.error('Error auto-filling business details:', error);
    }
}

// Apply Business Details to Current Invoice
function applyBusinessDetails() {
    autoFillBusinessDetails();
    showNotification('Business details applied to current invoice!', 'success');
}

// Business Logo Management
function uploadBusinessLogo() {
    document.getElementById('businessLogoInput').click();
}

function handleBusinessLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file!', 'error');
            return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showNotification('Image size should be less than 2MB!', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            businessDetails.logo = e.target.result;
            document.getElementById('businessLogoPreview').src = e.target.result;
            saveBusinessDetails();
        };
        reader.readAsDataURL(file);
    }
}

function removeBusinessLogo() {
    businessDetails.logo = '';
    document.getElementById('businessLogoPreview').src = '';
    document.getElementById('businessLogoInput').value = '';
    saveBusinessDetails();
}


// Open Business Modal
function openBusinessModal() {
    updateBusinessStats();
    updateBusinessForm();
    updateBusinessPreview();
    openModal('businessModal');
}

// Voice Commands for Business Details
function processBusinessVoiceCommand(transcript) {
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('business details') || lowerTranscript.includes('business setup') || lowerTranscript.includes('company details')) {
        openBusinessModal();
        if (document.getElementById('voiceStatus')) {
            document.getElementById('voiceStatus').textContent = 'Opening business details setup...';
        }
        speakText('Opening business details setup');
        return true;
    }
    
    if (lowerTranscript.includes('save business') || lowerTranscript.includes('update business')) {
        saveBusinessDetails();
        return true;
    }
    
    if (lowerTranscript.includes('apply business') || lowerTranscript.includes('use business details')) {
        applyBusinessDetails();
        return true;
    }
    
    return false;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initBusinessSystem();
    }, 1000);
});

// Add business commands to voice system
if (typeof processGeneralVoiceCommand === 'function') {
    const originalProcessGeneral = processGeneralVoiceCommand;
    window.processGeneralVoiceCommand = function(transcript) {
        if (processBusinessVoiceCommand(transcript)) {
            return;
        }
        return originalProcessGeneral(transcript);
    };
}












// OTP Verification Function
async function verifyOTP(email, otp, userData) {
    try {
        const response = await fetch('http://localhost:3000/api/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                otp: otp,
                name: userData.name,
                businessName: userData.businessName,
                phone: userData.phone
            })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('OTP verification error:', error);
        return { success: false, error: 'Network error' };
    }
}

// OTP Input Modal Create Karo
function createOTPModal(userData) {
    const modalHTML = `
        <div id="otpModal" class="modal active">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Verify OTP</h2>
                    <button class="modal-close" onclick="closeOTPModal()">×</button>
                </div>
                <div class="modal-body">
                    <p>OTP sent to ${userData.email}</p>
                    <div class="otp-input-group">
                        <input type="text" id="otpInput" placeholder="Enter 6-digit OTP" maxlength="6">
                    </div>
                    <div id="otpMessage" class="message"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="closeOTPModal()">Cancel</button>
                    <button class="btn btn-primary" onclick="submitOTP('${userData.email}', '${userData.name}', '${userData.businessName}', '${userData.phone}')">Verify OTP</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// OTP Submit Function
async function submitOTP(email, name, businessName, phone) {
    const otpInput = document.getElementById('otpInput');
    const otpMessage = document.getElementById('otpMessage');
    const otp = otpInput.value.trim();

    if (otp.length !== 6) {
        otpMessage.textContent = 'Please enter 6-digit OTP';
        otpMessage.className = 'message error';
        return;
    }

    // Show loading
    otpMessage.textContent = 'Verifying OTP...';
    otpMessage.className = 'message info';

    const userData = { name, businessName, phone, email };
    const result = await verifyOTP(email, otp, userData);

    if (result.success) {
        // OTP verified - create user profile
        createUserProfile(result.user || userData);
        closeOTPModal();
        showNotification('Account created successfully!', 'success');
    } else {
        otpMessage.textContent = result.error || 'OTP verification failed';
        otpMessage.className = 'message error';
    }
}

// OTP Modal Close
function closeOTPModal() {
    const modal = document.getElementById('otpModal');
    if (modal) modal.remove();
}

// User Profile Create Karo
function createUserProfile(userData) {
    // Save to localStorage
    localStorage.setItem('current_user', JSON.stringify(userData));
    
    // Hide signup button, show profile
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) signupBtn.style.display = 'none';
    
    // Create profile section if not exists
    let profileSection = document.getElementById('profileSection');
    if (!profileSection) {
        profileSection = document.createElement('div');
        profileSection.id = 'profileSection';
        profileSection.className = 'profile-section';
        document.querySelector('.nav-buttons').appendChild(profileSection);
    }
    
    profileSection.innerHTML = `
        <div class="profile-dropdown">
            <button class="profile-btn">
                <div class="profile-avatar">
                    ${userData.name.charAt(0).toUpperCase()}
                </div>
                <span>${userData.name}</span>
            </button>
        </div>
    `;
}

// Signup Form Update Karo - OTP bhejne wala function
async function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const businessName = document.getElementById('signupBusiness').value;

    // OTP send karo
    const otpResult = await sendOTP(email, name);
    
    if (otpResult.success) {
        // OTP modal show karo
        createOTPModal({ name, email, phone, businessName, password });
        closeModal('signupModal');
    } else {
        showNotification(otpResult.error || 'Failed to send OTP', 'error');
    }
}







// Bas yeh ADD KAR tere existing script.js mein
window.addEventListener('message', function(event) {
    if (event.data.type === 'SIGNUP_SUCCESS') {
        const user = event.data.user;
        userProfile.personal.name = user.name;
        userProfile.personal.email = user.email; 
        userProfile.personal.phone = user.phone;
        userProfile.business.name = user.businessName;
        updateUserProfile(user);
    }
});















// ==================== FIXED PAYMENT SYSTEM ====================

// Fixed Payment Mode Recognition
function getCurrentPaymentMode() {
    const activeButton = document.querySelector('.payment-btn.active');
    return activeButton ? activeButton.dataset.payment : '';
}

// Enhanced Save Invoice Data
function saveInvoiceData() {
    const customerName = document.getElementById('vendorName').value || 'Unknown Customer';
    const totalAmount = document.getElementById('summary-total').textContent;
    const paymentMode = getCurrentPaymentMode();
    const amountValue = parseFloat(totalAmount.replace('₹', '')) || 0;
    
    // Create invoice record
    const invoiceRecord = {
        id: 'INV-' + Date.now(),
        customer: customerName,
        amount: totalAmount,
        amountValue: amountValue,
        paymentMode: paymentMode || 'pending',
        date: new Date().toLocaleDateString('en-IN'),
        time: new Date().toLocaleTimeString('en-IN'),
        timestamp: new Date().toISOString(),
        status: paymentMode ? 'paid' : 'pending'
    };
    
    // Add to payment data
    paymentData.customers.unshift(invoiceRecord);
    
    // Update daily totals
    if (paymentMode && paymentMode !== 'udhaar') {
        paymentData.dailyTotals[paymentMode] += amountValue;
    }
    
    // Save to localStorage
    localStorage.setItem('sparkinvoice_payments', JSON.stringify(paymentData));
    
    // Update all profile sections
    updateAllProfileSections();
    updateBusinessStats();
    
    showNotification('Invoice data saved successfully!', 'success');
}

// Fixed Check Payment Status - VOICE FUNCTION
function checkPaymentStatus() {
    const customerName = document.getElementById('vendorName').value || 'Customer';
    const totalAmount = document.getElementById('summary-total').textContent.replace('₹', '');
    const paymentMode = getCurrentPaymentMode();
    const currentLanguage = document.getElementById('languageSelect').value;
    
    let message = '';
    
    if (paymentMode) {
        if (currentLanguage === 'hi-IN') {
            switch(paymentMode) {
                case 'cash':
                    message = `${totalAmount} rs Payment done by ${customerName} through Cash`;
                    break;
                case 'upi':
                    message = `${totalAmount} rs Payment done by ${customerName} through UPI`;
                    break;
                case 'card':
                    message = `${totalAmount} rs Payment done by ${customerName} through Card`;
                    break;
                case 'udhaar':
                    message = `${totalAmount} rs Payment pending by ${customerName} in Udhaar`;
                    break;
                case 'credit':
                    message = `${totalAmount} rs Payment done by ${customerName} through Credit`;
                    break;
                default:
                    message = `${totalAmount} rs Payment done by ${customerName}`;
            }
        } else {
            switch(paymentMode) {
                case 'cash':
                    message = `${totalAmount} rs Payment done by ${customerName} through Cash`;
                    break;
                case 'upi':
                    message = `${totalAmount} rs Payment done by ${customerName} through UPI`;
                    break;
                case 'card':
                    message = `${totalAmount} rs Payment done by ${customerName} through Card`;
                    break;
                case 'udhaar':
                    message = `${totalAmount} rs Payment pending by ${customerName} in Udhaar`;
                    break;
                case 'credit':
                    message = `${totalAmount} rs Payment done by ${customerName} through Credit`;
                    break;
                default:
                    message = `${totalAmount} rs Payment done by ${customerName}`;
            }
        }
    } else {
        // No payment mode selected - Use "Pending" in both languages
        if (currentLanguage === 'hi-IN') {
            message = `${customerName}, your total amount ${totalAmount} rs is Pending`;
        } else {
            message = `${customerName}, your total amount ${totalAmount} rs is Pending`;
        }
    }
    
    speakText(message);
    showNotification(message, 'info');
    
    // Auto-save if payment mode is selected
    if (paymentMode) {
        saveInvoiceData();
    }
}

// Update All Profile Sections - FIXED VERSION
function updateAllProfileSections() {
    // Update Business Stats FIRST
    updateBusinessStats();
    
    // Then update other sections with delay
    if (typeof loadInvoiceHistory === 'function') {
        setTimeout(loadInvoiceHistory, 100);
    }
    if (typeof loadPaymentHistory === 'function') {
        setTimeout(loadPaymentHistory, 200);
    }
    if (typeof loadLoanCustomers === 'function') {
        setTimeout(loadLoanCustomers, 300);
    }
    if (typeof loadCustomerHistory === 'function') {
        setTimeout(loadCustomerHistory, 400);
    }
}






// Update Business Statistics - MERGED VERSION
function updateBusinessStats() {
    try {
        // Load from BOTH data sources
        const paymentData = JSON.parse(localStorage.getItem('sparkinvoice_payments') || '{"customers":[]}');
        const oldInvoices = JSON.parse(localStorage.getItem('sparkinvoice_invoices') || '[]');
        
        // Combine data - NEW system priority
        const allInvoices = paymentData.customers && paymentData.customers.length > 0 
            ? paymentData.customers 
            : oldInvoices;
        
        // Calculate statistics
        const customers = [...new Set(allInvoices.map(inv => inv.customer))].length;
        const revenue = allInvoices.reduce((sum, inv) => {
            if (inv.amountValue) {
                return sum + inv.amountValue; // NEW system
            } else if (inv.amount) {
                return sum + parseFloat(inv.amount.replace('₹', '')) || 0; // NEW system
            } else if (inv.total) {
                return sum + parseFloat(inv.total.replace('₹', '')) || 0; // OLD system
            }
            return sum;
        }, 0);
        
        // Calculate days since business creation
        const businessDetails = JSON.parse(localStorage.getItem('sparkinvoice_business') || '{"createdAt":"2024-01-01"}');
        const createdDate = new Date(businessDetails.createdAt || new Date());
        const today = new Date();
        const daysActive = Math.ceil((today - createdDate) / (1000 * 60 * 60 * 24));
        
        // Update ALL UI elements
        const elements = {
            'businessInvoicesCount': allInvoices.length,
            'businessRevenue': '₹' + revenue.toFixed(2),
            'businessCustomers': customers,
            'businessDays': daysActive,
            'totalInvoices': allInvoices.length,
            'totalRevenue': '₹' + revenue.toFixed(2)
        };
        
        // Update each element
        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });
        
        console.log('Business stats updated:', { 
            invoices: allInvoices.length, 
            revenue, 
            customers, 
            daysActive 
        });
        
    } catch (error) {
        console.error('Error updating business stats:', error);
    }
}





    
    // Update profile menu badges
    updateProfileMenuBadges(totalInvoices, invoices.filter(inv => inv.paymentMode === 'udhaar').length);


// Update Profile Menu Badges
function updateProfileMenuBadges(invoiceCount, loanCount) {
    const badges = document.querySelectorAll('.menu-badge');
    badges.forEach(badge => {
        if (badge.textContent.includes('Invoice') || badge.closest('a').textContent.includes('Invoice')) {
            badge.textContent = invoiceCount;
        }
        if (badge.textContent.includes('Loan') || badge.closest('a').textContent.includes('Loan')) {
            badge.textContent = loanCount;
        }
        if (badge.textContent.includes('Payment') || badge.closest('a').textContent.includes('Payment')) {
            badge.textContent = invoiceCount;
        }
        if (badge.textContent.includes('Customer') || badge.closest('a').textContent.includes('Customer')) {
            badge.textContent = [...new Set(paymentData.customers.map(inv => inv.customer))].length;
        }
    });
}

// Enhanced Reset Current Invoice
function resetCurrentInvoice() {
    if (confirm('Are you sure you want to reset current invoice? This will clear customer data and items.')) {
        // Clear items list
        document.getElementById('itemsList').innerHTML = '';
        addItemRow();
        
        // Clear customer-specific fields
        document.getElementById('vendorName').value = '';
        document.getElementById('vendorAddress').value = '';
        document.getElementById('invoiceNumber').value = 'INV-' + Math.floor(1000 + Math.random() * 9000);
        
        // Reset payment mode
        paymentData.currentMode = '';
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById('upiSection').style.display = 'none';
        document.getElementById('udhaarSection').style.display = 'none';
        
        // Reset deposit amount
        document.getElementById('depositAmount').value = '';
        
        showNotification('Current invoice reset successfully!', 'info');
        updateInvoicePreview();
    }
}

// Auto-save System
function startAutoSave() {
    setInterval(() => {
        if (paymentData.autoSave && document.getElementById('vendorName').value) {
            saveInvoiceData();
            showNotification('Auto-saved successfully!', 'success');
        }
    }, 120000); // 2 minutes
}

// Initialize Payment System
function initPaymentSystem() {
    // Load saved payment data
    const savedPayments = localStorage.getItem('sparkinvoice_payments');
    if (savedPayments) {
        const parsedData = JSON.parse(savedPayments);
        paymentData = { ...paymentData, ...parsedData };
    }
    
    // Start auto-save
    startAutoSave();
    
    // Update profile sections on load
    setTimeout(updateAllProfileSections, 1000);
    
    console.log('Payment system initialized successfully');
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initPaymentSystem();
});











// Create Invoice History Modal
function createInvoiceHistoryModal() {
    const modalHTML = `
    <div id="invoiceHistoryModal" class="modal">
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h2><i class="fas fa-file-invoice"></i> Invoice History</h2>
                <button class="modal-close" onclick="closeModal('invoiceHistoryModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="invoice-history-container">
                    <!-- Filters -->
                    <div class="invoice-filters">
                        <div class="filter-group">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" id="invoiceSearch" placeholder="Search by customer, invoice number..." onkeyup="filterInvoices()">
                            </div>
                            <select id="invoiceTimeFilter" onchange="filterInvoices()">
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                            <button class="btn btn-outline" onclick="resetInvoiceFilters()">
                                <i class="fas fa-refresh"></i> Reset
                            </button>
                        </div>
                    </div>

                    <!-- Invoice Table -->
                    <div class="invoice-table-container">
                        <table class="invoice-history-table">
                            <thead>
                                <tr>
                                    <th>Invoice No.</th>
                                    <th>Customer</th>
                                    <th>Date & Time</th>
                                    <th>Amount</th>
                                    <th>Payment Method</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="invoiceHistoryBody">
                                <!-- Invoice data will load here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    if (!document.getElementById('invoiceHistoryModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Load Invoice History - FIXED
function loadInvoiceHistory() {
    const paymentData = JSON.parse(localStorage.getItem('sparkinvoice_payments') || '{"customers":[]}');
    const oldInvoices = JSON.parse(localStorage.getItem('sparkinvoice_invoices') || '[]');
    
    const invoices = paymentData.customers && paymentData.customers.length > 0 
        ? paymentData.customers 
        : oldInvoices;
    
    renderInvoiceHistory(invoices);
}

// Render Invoice History
function renderInvoiceHistory(invoices) {
    const tableBody = document.getElementById('invoiceHistoryBody');
    
    if (invoices.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    <div class="empty-state">
                        <i class="fas fa-file-invoice"></i>
                        <h3>No Invoices Found</h3>
                        <p>Create your first invoice to see history here</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let tableHTML = '';
    
    // Sort invoices by date (newest first)
    const sortedInvoices = invoices.sort((a, b) => 
        new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
    );
    
    sortedInvoices.forEach(invoice => {
        const date = new Date(invoice.timestamp || invoice.createdAt);
        const dateStr = date.toLocaleDateString('en-IN');
        const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        
        // Get invoice number from different structures
        const invoiceNumber = invoice.id || invoice.number || 'INV-001';
        
        // Get amount from different structures
        const amount = invoice.amount || invoice.total || '₹0';
        
        // Get payment method
        const paymentMethod = invoice.paymentMode || invoice.paymentMethod || 'cash';
        
        tableHTML += `
            <tr class="invoice-row">
                <td>
                    <div class="invoice-number-cell">${invoiceNumber}</div>
                </td>
                <td>
                    <div class="customer-cell-small">
                        <div class="customer-avatar-small">
                            ${invoice.customer.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div class="customer-info-small">
                            <div class="customer-name">${invoice.customer}</div>
                            <div class="customer-phone">${invoice.phone || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="datetime-cell">
                        <div class="date">${dateStr}</div>
                        <div class="time">${timeStr}</div>
                    </div>
                </td>
                <td>
                    <div class="amount-cell">${amount}</div>
                </td>
                <td>
                    <span class="payment-method-badge ${paymentMethod}">${paymentMethod}</span>
                </td>
                <td>
                    <span class="status-badge paid">Paid</span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon-small" onclick="viewInvoice('${invoice.id || invoiceNumber}')" title="View Invoice">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon-small" onclick="downloadInvoice('${invoice.id || invoiceNumber}')" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn-icon-small" onclick="printInvoice('${invoice.id || invoiceNumber}')" title="Print">
                            <i class="fas fa-print"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
}

// Open Invoice History
function openInvoiceHistory() {
    createInvoiceHistoryModal();
    loadInvoiceHistory();
    openModal('invoiceHistoryModal');
}

// Filter Invoices
function filterInvoices() {
    loadInvoiceHistory(); // Basic implementation
}

// Reset Invoice Filters
function resetInvoiceFilters() {
    document.getElementById('invoiceSearch').value = '';
    document.getElementById('invoiceTimeFilter').value = 'all';
    loadInvoiceHistory();
}









// Create Loan Management Modal
function createLoanManagementModal() {
    const modalHTML = `
    <div id="loanManagementModal" class="modal">
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h2><i class="fas fa-hand-holding-usd"></i> Loan Management</h2>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="addNewLoanCustomer()">
                        <i class="fas fa-plus"></i> Add Customer
                    </button>
                    <button class="modal-close" onclick="closeModal('loanManagementModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="modal-body">
                <div class="loan-management-container">
                    <!-- Loan Summary -->
                    <div class="loan-summary-grid">
                        <div class="loan-summary-card">
                            <div class="loan-summary-icon total-loan">
                                <i class="fas fa-money-bill-wave"></i>
                            </div>
                            <div class="loan-summary-content">
                                <div class="loan-summary-number" id="totalLoanAmount">₹0</div>
                                <div class="loan-summary-label">Total Loan Given</div>
                            </div>
                        </div>
                        <div class="loan-summary-card">
                            <div class="loan-summary-icon total-received">
                                <i class="fas fa-cash-register"></i>
                            </div>
                            <div class="loan-summary-content">
                                <div class="loan-summary-number" id="totalReceivedAmount">₹0</div>
                                <div class="loan-summary-label">Total Received</div>
                            </div>
                        </div>
                        <div class="loan-summary-card">
                            <div class="loan-summary-icon pending-amount">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="loan-summary-content">
                                <div class="loan-summary-number" id="totalPendingAmount">₹0</div>
                                <div class="loan-summary-label">Pending Amount</div>
                            </div>
                        </div>
                        <div class="loan-summary-card">
                            <div class="loan-summary-icon total-customers">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="loan-summary-content">
                                <div class="loan-summary-number" id="totalLoanCustomers">0</div>
                                <div class="loan-summary-label">Loan Customers</div>
                            </div>
                        </div>
                    </div>

                    <!-- Loan Customers Table -->
                    <div class="loan-table-container">
                        <table class="loan-customers-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Contact</th>
                                    <th>Total Loan</th>
                                    <th>Paid</th>
                                    <th>Balance</th>
                                    <th>Last Transaction</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="loanCustomersBody">
                                <!-- Loan customers will load here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    if (!document.getElementById('loanManagementModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Load Loan Customers - FIXED
function loadLoanCustomers() {
    const loanCustomers = JSON.parse(localStorage.getItem('sparkinvoice_loans') || '[]');
    updateLoanSummary(loanCustomers);
    renderLoanCustomers(loanCustomers);
}

// Update Loan Summary
function updateLoanSummary(loanCustomers) {
    const totalLoan = loanCustomers.reduce((sum, cust) => sum + cust.totalLoan, 0);
    const totalReceived = loanCustomers.reduce((sum, cust) => sum + cust.totalDeposited, 0);
    const totalPending = totalLoan - totalReceived;
    
    document.getElementById('totalLoanAmount').textContent = '₹' + totalLoan.toFixed(2);
    document.getElementById('totalReceivedAmount').textContent = '₹' + totalReceived.toFixed(2);
    document.getElementById('totalPendingAmount').textContent = '₹' + totalPending.toFixed(2);
    document.getElementById('totalLoanCustomers').textContent = loanCustomers.length;
}

// Render Loan Customers
function renderLoanCustomers(loanCustomers) {
    const tableBody = document.getElementById('loanCustomersBody');
    
    if (loanCustomers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-table">
                    <div class="empty-state">
                        <i class="fas fa-hand-holding-usd"></i>
                        <h3>No Loan Customers</h3>
                        <p>Add customers to manage loans</p>
                        <button class="btn btn-primary" onclick="addNewLoanCustomer()">
                            <i class="fas fa-plus"></i> Add First Customer
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let tableHTML = '';
    
    loanCustomers.forEach(customer => {
        const balance = customer.totalLoan - customer.totalDeposited;
        const lastTransaction = customer.transactions && customer.transactions.length > 0 
            ? customer.transactions[customer.transactions.length - 1] 
            : null;
        
        tableHTML += `
            <tr class="loan-customer-row">
                <td>
                    <div class="customer-cell-detailed">
                        <div class="customer-avatar-medium">
                            ${customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div class="customer-details">
                            <div class="customer-name">${customer.name}</div>
                            <div class="customer-id">${customer.id}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="contact-cell">
                        <div class="phone-number">${customer.mobile}</div>
                        <div class="customer-since">Since ${new Date(customer.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                </td>
                <td>
                    <div class="amount-cell">₹${customer.totalLoan.toFixed(2)}</div>
                </td>
                <td>
                    <div class="amount-cell paid-amount">₹${customer.totalDeposited.toFixed(2)}</div>
                </td>
                <td>
                    <div class="amount-cell ${balance > 0 ? 'pending-amount' : 'cleared-amount'}">
                        ₹${Math.abs(balance).toFixed(2)}
                    </div>
                </td>
                <td>
                    <div class="last-transaction">
                        ${lastTransaction ? `
                            <div class="transaction-type ${lastTransaction.type}">${lastTransaction.type}</div>
                            <div class="transaction-amount">₹${lastTransaction.amount.toFixed(2)}</div>
                            <div class="transaction-date">${new Date(lastTransaction.date).toLocaleDateString('en-IN')}</div>
                        ` : 'No transactions'}
                    </div>
                </td>
                <td>
                    <span class="status-badge ${balance === 0 ? 'cleared' : balance > 0 ? 'pending' : 'overpaid'}">
                        ${balance === 0 ? 'Cleared' : balance > 0 ? 'Pending' : 'Overpaid'}
                    </span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon-small" onclick="addLoanTransaction('${customer.id}')" title="Add Transaction">
                            <i class="fas fa-plus-circle"></i>
                        </button>
                        <button class="btn-icon-small" onclick="viewLoanHistory('${customer.id}')" title="View History">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn-icon-small" onclick="editLoanCustomer('${customer.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
}

// Open Loan Management
function openLoanManagement() {
    createLoanManagementModal();
    loadLoanCustomers();
    openModal('loanManagementModal');
}

// Add New Loan Customer
function addNewLoanCustomer() {
    const name = prompt('Enter customer name:');
    if (!name) return;
    
    const mobile = prompt('Enter customer mobile number:');
    if (!mobile) return;
    
    const newCustomer = {
        id: 'LOAN-' + Date.now(),
        name: name,
        mobile: mobile,
        totalLoan: 0,
        totalDeposited: 0,
        balance: 0,
        transactions: [],
        createdAt: new Date().toISOString()
    };
    
    const loanCustomers = JSON.parse(localStorage.getItem('sparkinvoice_loans') || '[]');
    loanCustomers.unshift(newCustomer);
    localStorage.setItem('sparkinvoice_loans', JSON.stringify(loanCustomers));
    
    showNotification(`${name} added to loan customers!`, 'success');
    loadLoanCustomers();
}














// Create Payment History Modal
function createPaymentHistoryModal() {
    const modalHTML = `
    <div id="paymentHistoryModal" class="modal">
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h2><i class="fas fa-credit-card"></i> Payment History</h2>
                <button class="modal-close" onclick="closeModal('paymentHistoryModal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="payment-history-container">
                    <!-- Payment Summary -->
                    <div class="payment-summary-grid">
                        <div class="payment-summary-card">
                            <div class="payment-summary-icon total-payments">
                                <i class="fas fa-money-check"></i>
                            </div>
                            <div class="payment-summary-content">
                                <div class="payment-summary-number" id="totalPaymentsCount">0</div>
                                <div class="payment-summary-label">Total Payments</div>
                            </div>
                        </div>
                        <div class="payment-summary-card">
                            <div class="payment-summary-icon cash-payments">
                                <i class="fas fa-money-bill"></i>
                            </div>
                            <div class="payment-summary-content">
                                <div class="payment-summary-number" id="cashPaymentsCount">0</div>
                                <div class="payment-summary-label">Cash Payments</div>
                            </div>
                        </div>
                        <div class="payment-summary-card">
                            <div class="payment-summary-icon upi-payments">
                                <i class="fas fa-mobile-alt"></i>
                            </div>
                            <div class="payment-summary-content">
                                <div class="payment-summary-number" id="upiPaymentsCount">0</div>
                                <div class="payment-summary-label">UPI Payments</div>
                            </div>
                        </div>
                        <div class="payment-summary-card">
                            <div class="payment-summary-icon card-payments">
                                <i class="fas fa-credit-card"></i>
                            </div>
                            <div class="payment-summary-content">
                                <div class="payment-summary-number" id="cardPaymentsCount">0</div>
                                <div class="payment-summary-label">Card Payments</div>
                            </div>
                        </div>
                    </div>

                    <!-- Payment History Table -->
                    <div class="payment-table-container">
                        <table class="payment-history-table">
                            <thead>
                                <tr>
                                    <th>Date & Time</th>
                                    <th>Customer</th>
                                    <th>Invoice No.</th>
                                    <th>Amount</th>
                                    <th>Payment Method</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="paymentHistoryBody">
                                <!-- Payment data will load here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    if (!document.getElementById('paymentHistoryModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Load Payment History - FIXED
function loadPaymentHistory() {
    const paymentData = JSON.parse(localStorage.getItem('sparkinvoice_payments') || '{"customers":[]}');
    const oldInvoices = JSON.parse(localStorage.getItem('sparkinvoice_invoices') || '[]');
    
    const payments = paymentData.customers && paymentData.customers.length > 0 
        ? paymentData.customers 
        : oldInvoices;
    
    updatePaymentSummary(payments);
    renderPaymentHistory(payments);
}

// Update Payment Summary
function updatePaymentSummary(payments) {
    const totalPayments = payments.length;
    const cashPayments = payments.filter(p => 
        (p.paymentMethod || p.paymentMode || 'cash') === 'cash'
    ).length;
    const upiPayments = payments.filter(p => 
        (p.paymentMethod || p.paymentMode || 'cash') === 'upi'
    ).length;
    const cardPayments = payments.filter(p => 
        (p.paymentMethod || p.paymentMode || 'cash') === 'card'
    ).length;
    
    document.getElementById('totalPaymentsCount').textContent = totalPayments;
    document.getElementById('cashPaymentsCount').textContent = cashPayments;
    document.getElementById('upiPaymentsCount').textContent = upiPayments;
    document.getElementById('cardPaymentsCount').textContent = cardPayments;
}

// Render Payment History
function renderPaymentHistory(payments) {
    const tableBody = document.getElementById('paymentHistoryBody');
    
    if (payments.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table">
                    <div class="empty-state">
                        <i class="fas fa-credit-card"></i>
                        <h3>No Payment History</h3>
                        <p>Payment records will appear here</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    let tableHTML = '';
    
    // Sort payments by date (newest first)
    const sortedPayments = payments.sort((a, b) => 
        new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
    );
    
    sortedPayments.forEach(payment => {
        const date = new Date(payment.timestamp || payment.createdAt);
        const dateStr = date.toLocaleDateString('en-IN');
        const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        
        // Get invoice number
        const invoiceNumber = payment.id || payment.number || 'INV-001';
        
        // Get amount
        const amount = payment.amount || payment.total || '₹0';
        
        // Get payment method
        const paymentMethod = payment.paymentMode || payment.paymentMethod || 'cash';
        
        tableHTML += `
            <tr class="payment-row">
                <td>
                    <div class="datetime-cell">
                        <div class="date">${dateStr}</div>
                        <div class="time">${timeStr}</div>
                    </div>
                </td>
                <td>
                    <div class="customer-cell-small">
                        <div class="customer-name">${payment.customer}</div>
                        <div class="customer-phone">${payment.phone || 'N/A'}</div>
                    </div>
                </td>
                <td>
                    <div class="invoice-number-cell">${invoiceNumber}</div>
                </td>
                <td>
                    <div class="amount-cell">${amount}</div>
                </td>
                <td>
                    <span class="payment-method-badge ${paymentMethod}">${paymentMethod}</span>
                </td>
                <td>
                    <span class="status-badge paid">Completed</span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon-small" onclick="viewPaymentDetails('${payment.id || invoiceNumber}')" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon-small" onclick="downloadReceipt('${payment.id || invoiceNumber}')" title="Download Receipt">
                            <i class="fas fa-receipt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
}

// Open Payment History
function openPaymentHistory() {
    createPaymentHistoryModal();
    loadPaymentHistory();
    openModal('paymentHistoryModal');
}




// Initialize all modals in DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    createInvoiceHistoryModal();
    createLoanManagementModal();
    createPaymentHistoryModal();
    createCustomerHistoryModal(); // Your existing one
});





