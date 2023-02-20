// Đối tượng của validator
function Validator(options) {
    var selectorRules = {}

    // Hàm thực hiện validate
    function validate (inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorMessage;

        // lấy ra các rules của selector
        var rules = selectorRules[rule.selector];
        
        // lặp qua từng rules và kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value)
            if(errorMessage) break;
        }

        
        if (errorMessage) {
            errorElement.innerHTML = errorMessage;
            inputElement.parentElement.classList.add('invalid');
        } else { 
            errorElement.innerHTML = '';
            inputElement.parentElement.classList.remove('invalid');
        }

        return !errorMessage;
    }

    // Lấy elements của form cần validate
    var formElement = document.querySelector(options.form);
    if (formElement) {

        // khi submit form
        formElement.onsubmit = function (e){
            e.preventDefault();

            var isFormValid = true;

            // Lập qua từng rules và validate
            options.rules.forEach(function (rule) {
                    var inputElement = formElement.querySelector(rule.selector);
                    var isValid =  validate(inputElement, rule)
                    if (!isValid) {
                        isFormValid = false;
                    }
            })

            var enableInput = formElement.querySelectorAll('[name]:not([disabled])');
           
            if (isFormValid) {
                // Trường hợp submit với javascript
                if(typeof options.onSubmit === 'function') {
                    var formValues = Array.from(enableInput).reduce(function(values, input) {
                        return (values[input.name] = input.value) && values;
                      }, {})
                    options.onSubmit(formValues)
                }
            } else {
                // submit với hành vi mặc định
                formElement.submit();
            }
            
        }

        // Lặp qua mỗi rules và xử lý (Lắng nghe sự kiện blur, input,...)
        options.rules.forEach(function (rule) {

            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }


            var inputElement = formElement.querySelector(rule.selector);

            if (inputElement) {
                // Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    // value: inputElement.value
                    // test func: rule.test
                    validate(inputElement, rule)
                    console.log(inputElement.parentElement.querySelector('.form-message'));
                };

                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElement = inputElement.parentElement.querySelector('.form-message')
                    errorElement.innerHTML = '';
                    inputElement.parentElement.classList.remove('invalid');
                }
            }

        })

 
    }
  }
  
  // Định nghĩa rules
  // Nguyen tat cua cac rules: 
  // 1. Khi có lỗi => Trả ra message lỗi
  // 2. khi hợp lệ => Không trả ra cái gì cả (undefined)
  Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
        }
    };
  };


  Validator.isEmail = function (selector) {
     return {
        selector: selector,
        test: function (value) {
            var regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
            return regex.test(value) ? undefined : 'Trường này phải là email'
        }
    };
  };
  
  Validator.minLength = function (selector, min) {
    return {
       selector: selector,
       test: function (value) {       
           return value.length >= min ? undefined : `Vui lập nhập tối thiểu ${min} ký tự`
       }
   };
 };

 Validator.isComfirmed = function (selector, getComfirmedValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getComfirmedValue() ? undefined : message || 'Giá trị nhập vào không tính xác'
        }
    }
 }