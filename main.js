
var buildPaymentForm = function (cards, paymentForm, methodContainer, method) {
    var cardDiv = document.createElement("div");
    cardDiv.className = "form-container";
    cardDiv.id = "selectedMethod";
    
    var methodForm = document.createElement("div");
    methodForm.id = method.id;
    methodForm.innerText = method.getAttribute('data-customField');


    var closeMethodBtn = document.createElement("button");
    closeMethodBtn.id = "closeMethodBtn"
    closeMethodBtn.innerText = "Close";
    closeMethodBtn.addEventListener("click", function () {
        if (paymentForm.firstElementChild != null) {
            methodContainer.classList = "flex-container";
            paymentForm.removeChild(paymentForm.firstChild);

            for (var i = 0; i < cards.length; i++) {
                cards[i].classList.remove("card-small");
            }
        }
    });

    cardDiv.appendChild(methodForm);
    cardDiv.appendChild(closeMethodBtn);

    paymentForm.appendChild(cardDiv);
};


window.addEventListener("load", function () {
    console.log("Document loaded!")
    var cards = document.querySelectorAll(".card");
    var paymentForm = document.getElementById("cashierPaymentForm");
    var methodContainer = document.getElementById("methodsContainer");
    
    for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function () {

            methodContainer.classList = "scrolling-wrapper";    

            if (paymentForm.firstElementChild != null) {
                paymentForm.removeChild(paymentForm.firstChild);
            }
            buildPaymentForm(cards, paymentForm, methodContainer,this);
            
            for (var i = 0; i < cards.length; i++) {
                cards[i].classList.add("card-small");
            }

        }, false);
    }

    



});