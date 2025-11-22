import React, { useState, useEffect } from 'react';
import { Trash2, Printer, Save, RotateCcw, CreditCard } from 'lucide-react';
import { toWords } from 'number-to-words';

// Standard Kenyan Banks List with their cheque dimensions
const KENYAN_BANKS = {
  "Family Bank": {
    name: "Family Bank",
    width: 179,
    height: 100 // Default
  },
  "Equity Bank": {
    name: "Equity Bank", 
    width: 178,
    height: 99
  },
  "KCB Bank": {
    name: "KCB Bank",
    width: 178,
    height: 101
  },
  "Bank of Africa": {
    name: "Bank of Africa",
    width: 179,
    height: 97
  },
  "Co-operative Bank": {
    name: "Co-operative Bank",
    width: 179,
    height: 99 
  },
  "NCBA Bank": {
    name: "NCBA Bank",
    width: 179,
    height: 100
  },
  "Absa Bank Kenya": {
    name: "Absa Bank Kenya",
    width: 179,
    height: 100
  },
  "Standard Chartered": {
    name: "Standard Chartered",
    width: 179,
    height: 100
  },
  "Diamond Trust Bank (DTB)": {
    name: "Diamond Trust Bank (DTB)",
    width: 179,
    height: 100
  },
  "Stanbic Bank": {
    name: "Stanbic Bank",
    width: 179,
    height: 100
  },
  "I&M Bank": {
    name: "I&M Bank",
    width: 179,
    height: 100
  },
  "Kingdom Bank": {
    name: "Kingdom Bank",
    width: 179,
    height: 100
  },
  "SBM Bank": {
    name: "SBM Bank",
    width: 179,
    height: 100
  }
};

// Bank-specific field positions (adjusted based on height)
// Fixed positions - all measured from TOP of the cheque
const getFieldPositions = () => {
  // All positions are measured from TOP of cheque and are fixed
  return {
    date: {
      left: 135,
      top: 7 // 12mm from top
    },
    payee: {
      left: 20,
      top: 47 // 47mm from top (pay line)
    },
    amount: {
      left: 135,
      top: 42 // 42mm from top (amount figures)
    },
    words1: {
      left: 40,
      top: 58 // 58mm from top (first words line)
    },
    words2: {
      left: 7,
      top: 67 // 67mm from top (second words line)
    },
    memo: {
      left: 7,
      top: 82 // 82mm from top (memo line)
    }
  };
};

export default function App() {
  // State for form data
  const [formData, setFormData] = useState({
    payee: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    bank: '',
    memo: ''
  });

  // State for derived data
  const [amountInWords, setAmountInWords] = useState('');
  const [savedCheques, setSavedCheques] = useState([]);
  const [notification, setNotification] = useState(null);
  const [currentBankDimensions, setCurrentBankDimensions] = useState(null);

  // Load saved cheques from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kenyan_cheque_records');
    if (saved) {
      setSavedCheques(JSON.parse(saved));
    }
  }, []);

  // Update dimensions when bank changes
  useEffect(() => {
    if (formData.bank && KENYAN_BANKS[formData.bank]) {
      const bankInfo = KENYAN_BANKS[formData.bank];
      setCurrentBankDimensions(bankInfo);
      
      // Update print styles dynamically
      updatePrintStyles(bankInfo);
    }
  }, [formData.bank]);

  // Function to update print styles based on bank dimensions
  // Function to update print styles based on bank dimensions
const updatePrintStyles = (bankInfo) => {
  const positions = getFieldPositions(); // Remove the parameter
  
  const style = document.createElement('style');
  style.id = 'dynamic-print-styles';
  
  style.textContent = `
    @media print {
      @page {
        size: auto;
        margin: 0mm;
      }
      body * {
        visibility: hidden;
      }
      #cheque-print-area, #cheque-print-area * {
        visibility: visible;
      }
      #cheque-print-area {
        display: block !important; 
        position: absolute;
        left: 0;
        top: 0;
        width: ${bankInfo.width}mm;
        height: ${bankInfo.height}mm;
        margin: 0;
        padding: 0;
        background: white;
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 10pt;
      }

      .print-date { 
        position: absolute; 
        left: ${positions.date.left}mm; 
        top: ${positions.date.top}mm;
        letter-spacing: 1px;
        font-size: 8pt;
      }

      .print-payee { 
        position: absolute; 
        left: ${positions.payee.left}mm; 
        top: ${positions.payee.top}mm;
        text-transform: uppercase;
        font-size: 10pt;
      }

      .print-amount-figures { 
        position: absolute; 
        left: ${positions.amount.left}mm; 
        top: ${positions.amount.top}mm;
        font-weight: bold;
        font-size: 12pt;
      }

      .print-words-1 { 
        position: absolute; 
        left: ${positions.words1.left}mm; 
        top: ${positions.words1.top}mm;
        text-transform: uppercase;
        font-size: 8pt;
      }

      .print-words-2 { 
        position: absolute; 
        left: ${positions.words2.left}mm; 
        top: ${positions.words2.top}mm;
        text-transform: uppercase;
        font-size: 8pt;
      }

      .print-memo { 
        position: absolute; 
        left: ${positions.memo.left}mm; 
        top: ${positions.memo.top}mm;
        font-size: 9pt;
      }

      .no-print { display: none !important; }
    }
  `;
  
  // Remove existing dynamic styles
  const existingStyle = document.getElementById('dynamic-print-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  document.head.appendChild(style);
};

  // Convert Number to Words using 'number-to-words' package
  const numberToWords = (num) => {
    if (!num || num === 0) return '';
    
    try {
      const n = parseInt(num);
      let words = toWords(n);
      
      words = words.toUpperCase();
      
      words = words.replace(/ BILLION /g, ' BILLION, ');
      words = words.replace(/ MILLION /g, ' MILLION, ');
      words = words.replace(/ THOUSAND /g, ' THOUSAND, ');
      
      const parts = words.split(', ');
      const formattedParts = parts.map(part => {
        if (part.includes(' HUNDRED ')) {
          const hundredSplit = part.split(' HUNDRED ');
          if (hundredSplit.length > 1 && hundredSplit[1].trim()) {
            return hundredSplit[0] + ' HUNDRED AND ' + hundredSplit[1];
          }
        }
        return part;
      });
      
      words = formattedParts.join(', ');
      
      return words + ' ***' ;
    } catch (error) {
      console.error('Error converting number to words:', error);
      return 'Error: Run "npm install number-to-words"';
    }
  };

  // Helper to split words into two lines if too long
  const getSplitWords = (text) => {
    const CHAR_LIMIT = 45; 
    if (!text || text.length <= CHAR_LIMIT) return { line1: text || '', line2: '' };
    
    const splitIndex = text.lastIndexOf(' ', CHAR_LIMIT);
    if (splitIndex === -1) return { line1: text.substring(0, CHAR_LIMIT), line2: text.substring(CHAR_LIMIT) };

    return {
        line1: text.substring(0, splitIndex),
        line2: text.substring(splitIndex + 1)
    };
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'amount') {
      setAmountInWords(numberToWords(value));
    }
  };

  // Handle Manual Edits to Amount In Words
  const handleWordChange = (e) => {
    setAmountInWords(e.target.value.toUpperCase());
  };

  // Save to LocalStorage
  const saveRecord = () => {
    if (!formData.payee || !formData.amount || !formData.bank) {
      alert("Please fill in Payee, Amount and Bank to save.");
      return;
    }
    
    const newRecord = {
      id: Date.now(),
      ...formData,
      amountInWords
    };
    
    const updatedRecords = [newRecord, ...savedCheques];
    setSavedCheques(updatedRecords);
    localStorage.setItem('kenyan_cheque_records', JSON.stringify(updatedRecords));
    
    setNotification("Record saved successfully!");
    setTimeout(() => setNotification(null), 3000);
  };

  // Load a saved record
  const loadRecord = (record) => {
    setFormData({
      payee: record.payee,
      amount: record.amount,
      date: new Date().toISOString().split('T')[0],
      bank: record.bank,
      memo: record.memo || ''
    });
    
    if (record.amountInWords) {
      setAmountInWords(record.amountInWords);
    } else {
      setAmountInWords(numberToWords(record.amount));
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete a record
  const deleteRecord = (id) => {
    if(window.confirm("Are you sure you want to delete this record?")) {
      const updatedRecords = savedCheques.filter(rec => rec.id !== id);
      setSavedCheques(updatedRecords);
      localStorage.setItem('kenyan_cheque_records', JSON.stringify(updatedRecords));
    }
  };

  const handlePrint = () => {
    if(!formData.bank) {
      alert("Please select a bank first.");
      return;
    }
    window.print();
  };

  const wordLines = getSplitWords(amountInWords);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Dynamic styles are now added via JavaScript */}

      <div className="container mx-auto p-4 no-print">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kenyan Cheque Printer</h1>
          <p className="text-gray-600">Manage recurring payments and print cheques easily.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" /> Cheque Details
                </h2>
                {notification && (
                  <span className="text-green-600 text-sm font-bold animate-pulse">{notification}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank</label>
                  <select 
                    name="bank"
                    value={formData.bank}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  >
                    <option value="">-- Choose Bank --</option>
                    {Object.keys(KENYAN_BANKS).map(bankKey => (
                      <option key={bankKey} value={bankKey}>
                        {KENYAN_BANKS[bankKey].name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {formData.bank && currentBankDimensions && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <span className="font-bold">📄 Cheque Info:</span> Using {formData.bank} template 
                        ({currentBankDimensions.width}mm × {currentBankDimensions.height}mm)
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Field positions automatically adjusted for perfect alignment
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payee Name</label>
                <input 
                  type="text" 
                  name="payee"
                  placeholder="e.g. Kenya Power & Lighting Co."
                  value={formData.payee}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (Figures)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">KES</span>
                  <input 
                    type="number" 
                    name="amount"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full p-2 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
                
                <label className="block text-xs font-medium text-gray-500 mt-3 mb-1">Amount in Words (Editable)</label>
                <textarea
                  name="amountInWords"
                  value={amountInWords}
                  onChange={handleWordChange}
                  placeholder="Words will appear here..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm uppercase bg-gray-50 font-medium text-gray-700"
                  rows={2}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Memo / Reference</label>
                <input 
                  type="text" 
                  name="memo"
                  placeholder="e.g. Invoice #1024"
                  value={formData.memo}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handlePrint}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-semibold"
                >
                  <Printer className="w-5 h-5" /> Print Cheque
                </button>
                <button 
                  onClick={saveRecord}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" /> Save
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-inner border border-gray-300 overflow-hidden relative h-48 select-none opacity-75 grayscale">
              <div className="absolute top-0 left-0 bg-gray-200 text-gray-500 text-xs px-2 py-1 rounded-br">Rough Preview</div>
              <div className="text-right font-mono mb-4">{formData.date}</div>
              <div className="mb-4 font-mono uppercase">Pay: {formData.payee || "________________"}</div>
              <div className="flex justify-between items-end">
                <div className="text-xs w-2/3 leading-relaxed border-b border-gray-300 pb-1">
                  {wordLines.line1} {wordLines.line2}
                </div>
                <div className="border border-gray-800 px-4 py-1 font-bold font-mono bg-gray-50">
                  {formData.amount ? `KES ${parseInt(formData.amount).toLocaleString()}` : "KES 000,000"}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-full max-h-[600px]">
              <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-700">Recurring Cheques</h3>
                <p className="text-xs text-gray-500">Click load to autofill</p>
              </div>
              
              <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {savedCheques.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <p>No saved cheques.</p>
                  </div>
                ) : (
                  savedCheques.map(record => (
                    <div key={record.id} className="bg-white border border-gray-200 p-3 rounded-lg hover:shadow-md transition group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-800">{record.payee}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{record.bank}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        KES {parseInt(record.amount).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 italic mb-3">
                        Ref: {record.memo || 'N/A'}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => loadRecord(record)}
                          className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded flex items-center justify-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Load
                        </button>
                        <button 
                          onClick={() => deleteRecord(record.id)}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 rounded flex items-center justify-center"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div id="cheque-print-area" className="hidden">
        <div className="print-date">
          {formData.date.split('-').reverse().join('/')}
        </div>
        <div className="print-payee">
          {formData.payee}
        </div>
        <div className="print-words-1">
          {wordLines.line1}
        </div>
        <div className="print-words-2">
          {wordLines.line2}
        </div>
        <div className="print-amount-figures">
          {formData.amount ? parseInt(formData.amount).toLocaleString() : ''}
        </div>
        <div className="print-memo">
          {formData.memo}
        </div>
      </div>

        {/* Watermark Footer */}
        <footer className="no-print text-center py-4 text-gray-500 text-sm mt-8 border-t border-gray-200">
          <p>
            Developed by{' '}
            <a 
              href="https://github.com/am-eric" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              am-eric
            </a>
          </p>
        </footer>


    </div>

    
  );
}