const input = document.querySelector("#phoneNumber");
                window.intlTelInput(input, {
                    autoInsertDialCode: true,
                    nationalMode: false,
                    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/19.5.6/js/utils.js",
                });