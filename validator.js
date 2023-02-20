// Đối tượng của validator
function Validator(options) {
    function getParent(element, selector ) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }



    var selectorRules = {}

    // Hàm thực hiện validate
    function validate (inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        // lấy ra các rules của selector
        var rules = selectorRules[rule.selector];
        
        // lặp qua từng rules và kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked') 
                    )
                    break
                default: 
                    errorMessage = rules[i](inputElement.value)

            }
            if(errorMessage) break;
        }

        
        if (errorMessage) {
            errorElement.innerHTML = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else { 
            errorElement.innerHTML = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    // Lấy elements của form cần validatess
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

           
            if (isFormValid) {
                // Trường hợp submit với javascript
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if(!input.matches(':checked')) {
                                    values[input.name] = "";
                                    return values;
                                }

                                if(!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value);
                                break; 
                            default:
                                values[input.name] = input.value

                        }
                        return values;
                      }, {})
                    options.onSubmit(formValues)
                }
            else {
                // submit với hành vi mặc định
                formElement.submit();
            }
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


            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {
                 // Xử lý trường hợp blur khỏi input
                 inputElement.onblur = function () {
                    // value: inputElement.value
                    // test func: rule.test
                    validate(inputElement, rule)
                    console.log(getParent(inputElement, options.formGroupSelector).querySelector('.form-message'));
                };

                // Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message')
                    errorElement.innerHTML = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            })

           

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
            return value ? undefined : message || 'Vui lòng nhập trường này'
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