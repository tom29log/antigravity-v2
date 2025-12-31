function doPost(e) {
    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        var data = JSON.parse(e.postData.contents);

        // 1. Save to Google Sheet
        sheet.appendRow([
            data.timestamp,
            data.name,
            data.email,
            data.phone,
            data.serviceType,
            data.subType,
            data.area,
            data.bathCount,
            data.style,
            data.estimateStandard,
            data.estimatePremium,
            data.message
        ]);

        // 2. Send Email Notification
        var subject = "[On and Noch] 새로운 견적 문의: " + data.name + "님";
        var body = "새로운 견적 문의가 접수되었습니다.\n\n" +
            "이름: " + data.name + "\n" +
            "이메일: " + data.email + "\n" +
            "연락처: " + data.phone + "\n" +
            "유형: " + data.serviceType + " (" + data.subType + ")\n" +
            "스타일: " + data.style + "\n" +
            "예상 견적: " + formatCurrency(data.estimateStandard) + " ~ " + formatCurrency(data.estimatePremium) + "\n\n" +
            "자세한 내용은 구글 시트를 확인하세요.";

        MailApp.sendEmail({
            to: "onandnoch@gmail.com", // 수신할 관리자 이메일
            subject: subject,
            body: body
        });

        return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function formatCurrency(val) {
    return "₩" + parseInt(val).toLocaleString();
}
