var ringId = 0;
document.querySelectorAll("#flexSwitchCheckChecked").forEach(btn => {
    btn.onclick = (evnt) => {
        ringId = evnt.target.parentElement.children[0].value;

        let value = true;
        if (evnt.target.checked) {
            value = true;
        } else {
            value = false;
        }
        const data = {
            isactive: value,
        };

        // `fetch` orqali PUT so'rovini yuborish
        fetch(`api/ring/update/${ringId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    console.log(response.text())
                    return response.json().then(err => { throw new Error(err.error || 'Unknown error') });
                }
                return response.json();
            })
            .then(result => {
                console.log('Success:', result);
            })
            .catch(error => {
                console.error('Error:', error);
                if (!value) {
                    evnt.target.value == "on";
                } else {
                    evnt.target.value == "off";
                }
            });

    }
});


function tasdiqlash(xabar, id, tbody, callback) {
    let deviceid = id;
    const dialog = document.getElementById('dialog');
    const message = document.getElementById('dialog-message');
    const yesButton = document.getElementById('dialog-yes');
    const noButton = document.getElementById('dialog-no');

    message.textContent = xabar;
    dialog.style.display = 'flex';
    if (dialog.style.display != 'flex') {
        dialog.style.display = 'flex';
    }
    yesButton.onclick = function () {

        let selectedDays = document.getElementById("multiselect").selectedOptions;
        let selectedDaysArray = [];
        for (let index = 0; index < selectedDays.length; index++) {
            selectedDaysArray.push(parseInt(selectedDays[index].value));
        }

        var formData = new FormData(document.getElementById("queryform"));
        let jsonData = {};

        formData.forEach((value, key) => {
            jsonData[key] = value;
        });
        if (jsonData.turn_off_after_work) {
            if (jsonData.turn_off_after_work == "on") {
                jsonData.turn_off_after_work = true;
            }
            jsonData.turn_off_after_work = false;
        }
        jsonData.iddevice = parseInt(deviceid);
        jsonData.days = selectedDaysArray;
        let jsonString = JSON.stringify(jsonData);

        console.log(jsonString);

        var xhr = new XMLHttpRequest();

        xhr.open('POST', '/api/ring/add', true);

        xhr.withCredentials = true;

        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        xhr.onload = function () {
            if (xhr.status === 200) {
                console.log('Form ma\'lumotlari yuborildi:', xhr.responseText);
                if (dialog.style.display != 'none') {
                    dialog.style.display = 'none';
                }
                try {
                    let jsonRespons = JSON.parse(xhr.responseText);
                    jsonRespons.days = getDays(jsonRespons.days);
                    let row = getRow(jsonRespons);
                    tbody.innerHTML += row;
                    console.log(row);
                } catch (e) {
                    console.error("Xato: JSON ma'lumotini o'qishda xato yuz berdi.", e);
                }
                callback(true);
            } else {
                console.error('Xato:', xhr.status, xhr.statusText, xhr.responseText);
                callback(false);
            }
        };
        xhr.send(jsonString);


    };
    noButton.onclick = function () {
        if (dialog.style.display != 'none') {
            dialog.style.display = 'none';
        }
        callback(false);
    };
}





function getRow(obj) {
    return `<tr>
    <td>${obj.name}</td>
    <td>${obj.time}</td>
    <td>
    <div class="form-check form-switch">
    <input class="form-check-input" id="flexSwitchCheckChecked" type="checkbox" role="switch" checked="">
    </div>
    </td>
    <td>${obj.days}</td>
    <td>${obj.call_duration}</td>
    <td>${obj.call_delay}</td>
    <td>${obj.count}</td>
    <td>
    <a class="btn btn-sm btn-danger" href="/api/ring/delete/${obj.id}">O'chirish</a>
    </td>
    </tr>`
}


function getDays (arr) {
    const daysMap = {1: 'DSH',2: 'SSh',3: 'CHR',4: 'PAY',5: 'JU',6: 'SHN'   };
    if (arr.length === 6 && arr.every(day => day >= 1 && day <= 6)) {
        return 'HAR KUN';
    }
    return arr.map(day => daysMap[day]).join(', ');
}