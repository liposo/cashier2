window.addEventListener("load", function () {
    console.log("Document loaded!")
    var cards = document.querySelectorAll(".card");
    var cashierFormSection = document.getElementById("cashierPaymentForm");
    var methodContainer = document.getElementById("methodsContainer");

    for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function () {

            methodContainer.classList = "scrolling-wrapper";

            cashierFormSection.removeChild(cashierFormSection.firstChild);
            
            buildPaymentForm(cards, cashierFormSection, this);

            for (var i = 0; i < cards.length; i++) {
                cards[i].classList.add("card-small");
                cards[i].style.display = 'flex';
            }

            this.style.display = 'none';

        }, false);
    }
});


function buildPaymentForm(cards, cashierFormSection, method) {
    var methodData = getMethodData(method);

    //<div id="selectedMethod" class="method-container">
    var selectedMethod = document.createElement("div");
    selectedMethod.className = "method-container";
    selectedMethod.id = methodData.id;

    //<form id="cashierForm" class="form-wrapper">
    var form = document.createElement("form");
    form.id = "cashierForm";
    form.classList = "form-wrapper";
    form.appendChild(buildLogoAmountRow(methodData));

    selectedMethod.appendChild(form);
    cashierFormSection.appendChild(selectedMethod);
};

function buildLogoAmountRow(method) {
    //<div class="logo-amount-row">
    var logoAmountRow = document.createElement("div");
    logoAmountRow.classList = "logo-amount-row";

    logoAmountRow.appendChild(buildLogo(method));
    logoAmountRow.appendChild(buildAmount(method));

    return logoAmountRow;
}

function buildLogo(method) {
     //<div class="form-logo">
     var divLogo = document.createElement("div");
     divLogo.classList = "form-logo";
 
     //<img src="img/bigwallet.svg">
     var logo = document.createElement("img");
     logo.src = method.logo;
 
     //<small>10 EUR - EUR</small>
     var amountRangeText = document.createElement("small");
     amountRangeText.innerHTML = method.amountrange;
 
     divLogo.appendChild(logo);
     divLogo.appendChild(amountRangeText);

     return divLogo;
}

function buildAmount(method) {
    //<div class="amount-container">
        //<div class="predefined-amount-row">
            //<span>Amount: </span>
            //<label class="radio-container">
                //<input id="amount100" name="amount" type="radio" value="100" checked="checked">
                //<span class="checkmark"></span>

        //<div class="manual-amount-row">
            //<label class="radio-container radio-container-manual-amount">            
                //<input id="manualAmountRadio" name="amount" type="radio" value="">
                //<span class="checkmark"></span>
            //<div class="manual-amount">
                //<input class="text-input has-error" name="amount" id="manualAmountInput" type="text" placeholder="Amount" />    
                //<div class="">Small text under the amount input</div>
        //<div class="error">Amount out of range</div>    
            
}

function getMethodData(method) {
    return mathodData = {
        method: method.getAttribute('data-method'),
        selected: method.getAttribute('data-selected'),
        amount: method.getAttribute('data-amount'),
        predefinedamounts: method.getAttribute('data-predefinedamounts'),
        defaultamount: method.getAttribute('data-defaultamount'),
        currency: method.getAttribute('data-currency'),
        custompaymentmethod: method.getAttribute('data-custompaymentmethod'),
        errors: method.getAttribute('data-errors'),
        customfield: method.getAttribute('data-customfield'),
        logo: method.getAttribute('data-logo'),
        customFieldValue: method.getAttribute('data-customfieldvalue'),
        amountrange: method.getAttribute('data-amountrange')
    }
}