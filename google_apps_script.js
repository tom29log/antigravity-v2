function doPost(e) {
    // 1. Parse the incoming data
    var data = JSON.parse(e.postData.contents);

    // 2. Open the Spreadsheet by ID (웹앱에서는 getActiveSpreadsheet()가 작동하지 않음)
    // ⚠️ 아래 SPREADSHEET_ID를 실제 구글 시트 ID로 교체하세요!
    var SPREADSHEET_ID = '1FIrHfeiK630R2xF1YP8fGvQfJDuL3Gov7UASwKW1M24';
    var SHEET_NAME = '시트1';  // 첫 번째 시트 (gid=0)

    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];

    // 3. Add Header Row if it doesn't exist
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(["타임스탬프", "이름", "이메일", "전화번호", "서비스유형", "상세유형", "면적(평)", "스타일", "선택플랜", "견적(Standard)", "견적(Premium)", "메시지"]);
    }

    // 4. Save Data to Sheet
    sheet.appendRow([
        new Date(),
        data.name,
        data.email,
        data.phone,
        data.serviceType,
        data.subType,
        data.area,
        data.style,
        data.selectedPlan,
        data.estimateStandard,
        data.estimatePremium,
        data.message
    ]);

    // 5. Send Email Notification
    var subject = "[새로운 견적 문의] " + data.name + "님의 문의가 도착했습니다.";
    var body =
        "이름: " + data.name + "\n" +
        "연락처: " + data.phone + "\n" +
        "이메일: " + data.email + "\n" +
        "서비스: " + data.serviceType + " (" + data.subType + ")\n" +
        "면적: " + data.area + "평\n" +
        "스타일: " + data.style + "\n" +
        "선택플랜: " + data.selectedPlan + "\n" +
        "예상견적(Premium): " + formatCurrency(data.estimatePremium) + "\n" +
        "메시지:\n" + data.message;

    MailApp.sendEmail({
        to: "onandnoch@gmail.com",
        subject: subject,
        body: body
    });

    // 6. Return Success Response
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
        .setMimeType(ContentService.MimeType.JSON);
}

function formatCurrency(value) {
    if (!value) return "0원";
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
}
