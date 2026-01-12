function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var SPREADSHEET_ID = '1FIrHfeiK630R2xF1YP8fGvQfJDuL3Gov7UASwKW1M24';
        var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
        var data = JSON.parse(e.postData.contents);
        var fileLinks = [];

        // 파일 업로드 처리
        if (data.files && data.files.length > 0) {
            try {
                var folderName = "고객문의_첨부파일";
                var folders = DriveApp.getFoldersByName(folderName);
                var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
                var subFolder = folder.createFolder(data.name + "_" + new Date().getTime());

                for (var i = 0; i < data.files.length; i++) {
                    var fileData = data.files[i];
                    var blob = Utilities.newBlob(Utilities.base64Decode(fileData.base64), fileData.type, fileData.name);
                    var file = subFolder.createFile(blob);
                    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
                    fileLinks.push(file.getUrl());
                }
            } catch (fileError) {
                fileLinks.push("파일 업로드 오류: " + fileError.toString());
            }
        }

        // 1. 새 행을 상단(헤더 바로 아래)에 추가
        sheet.insertRowAfter(1);

        // 2. 데이터 입력 (2번째 행에)
        var newRowData = [
            new Date(),
            data.name,
            data.email,
            data.phone,
            data.serviceType,
            data.subType,
            data.area,
            data.bathCount || '',
            data.style,
            data.estimateStandard,
            data.estimatePremium,
            data.message,
            fileLinks.join("\n"),
            false // 완료 체크박스 (기본값: 미확인)
        ];

        sheet.getRange(2, 1, 1, 14).setValues([newRowData]);

        // [추가] 2행 14열(N열)에 체크박스 강제 설정
        sheet.getRange(2, 14).setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox().build());

        // [추가] 조건부 서식(노란색 하이라이트) 강제 재적용
        applyConditionalFormatting(sheet);

        // 이메일 알림
        MailApp.sendEmail({
            to: "onandnoch@gmail.com",
            subject: "[On and Noch] 새로운 견적 문의: " + data.name + "님",
            body: "새로운 견적 문의가 접수되었습니다.\n\n" +
                "이름: " + data.name + "\n" +
                "연락처: " + data.phone + "\n" +
                "이메일: " + data.email + "\n" +
                "서비스: " + data.serviceType + " (" + data.subType + ")\n" +
                "면적: " + data.area + "평\n" +
                "스타일: " + data.style + "\n\n" +
                "메시지:\n" + data.message
        });

        return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

// 조건부 서식을 강제로 A2:N 범위에 다시 적용하는 함수
function applyConditionalFormatting(sheet) {
    var rules = sheet.getConditionalFormatRules();
    var newRules = [];
    var formula = '=$N2=FALSE';

    // 1. 기존 규칙 중 우리가 설정한 규칙(공식이 같은 것)은 제거 (중복/범위밀림 방지)
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        var criteria = rule.getBooleanCondition();
        // 사용자 지정 수식이고, 수식이 우리 것과 비슷하면 건너뜀
        if (criteria && criteria.getCriteriaType() == SpreadsheetApp.BooleanCriteria.CUSTOM_FORMULA) {
            var f = criteria.getCriteriaValues()[0];
            if (f.indexOf('$N') > -1 && f.indexOf('FALSE') > -1) {
                continue;
            }
        }
        newRules.push(rule);
    }

    // 2. 새 규칙 생성 (A2부터 시작하도록 범위 고정)
    // [수정] 데이터가 있을 때만(A행이 비어있지 않을 때) 노란색 적용
    var yellowRule = SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('=AND($N2=FALSE, $A2<>"")')
        .setBackground("#FFF2CC") // 연한 노란색
        .setRanges([sheet.getRange("A2:N")])
        .build();

    // 3. 새 규칙을 맨 앞에 추가 (우선순위 최상위)
    newRules.unshift(yellowRule);
    sheet.setConditionalFormatRules(newRules);
}

// ⚠️ 초기 설정용 (이제는 doPost에서 자동 실행되므로 따로 안 돌려도 됨)
function setupSheetFeatures() {
    var SPREADSHEET_ID = '1FIrHfeiK630R2xF1YP8fGvQfJDuL3Gov7UASwKW1M24';
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    applyConditionalFormatting(sheet);
}

function formatCurrency(value) {
    if (!value) return "0원";
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
}
