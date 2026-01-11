function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        // Use the first sheet explicitly to avoid "ActiveSheet" ambiguity
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
        var data = JSON.parse(e.postData.contents);
        var fileLinks = [];

        // 1. Handle File Uploads (if any)
        if (data.files && data.files.length > 0) {
            try {
                // Get or Create "Portfolio_Inquiry_Attachments" Folder
                var folderName = "Portfolio_Inquiry_Attachments";
                var folders = DriveApp.getFoldersByName(folderName);
                var folder;

                if (folders.hasNext()) {
                    folder = folders.next();
                } else {
                    folder = DriveApp.createFolder(folderName);
                }

                // Create a subfolder for this specific inquiry (Name_Timestamp)
                var subFolderName = data.name + "_" + new Date().getTime();
                var subFolder = folder.createFolder(subFolderName);

                // Save files
                for (var i = 0; i < data.files.length; i++) {
                    var fileData = data.files[i]; // { name: "img.jpg", type: "image/jpeg", base64: "..." }
                    var blob = Utilities.newBlob(Utilities.base64Decode(fileData.base64), fileData.type, fileData.name);
                    var file = subFolder.createFile(blob);
                    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); // Make public viewable
                    fileLinks.push(file.getUrl());
                }
            } catch (fileError) {
                fileLinks.push("Error uploading files: " + fileError.toString());
            }
        }

        var fileLinksString = fileLinks.join("\n");

        // 2. Save to Google Sheet
        // Ensure the sheet has enough columns. Add "Attachments" column if needed.
        // Assuming Column L (12) is Message, we add M (13) for Attachments.

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
            data.message,
            fileLinksString // New Column: Attachments
        ]);

        // 3. Send Email Notification
        var subject = "[On and Noch] 새로운 견적 문의: " + data.name + "님 (파일첨부: " + fileLinks.length + "개)";
        var body = "새로운 견적 문의가 접수되었습니다.\n\n" +
            "이름: " + data.name + "\n" +
            "이메일: " + data.email + "\n" +
            "연락처: " + data.phone + "\n" +
            "유형: " + data.serviceType + " (" + data.subType + ")\n" +
            "스타일: " + data.style + "\n" +
            "예상 견적: " + formatCurrency(data.estimateStandard) + " ~ " + formatCurrency(data.estimatePremium) + "\n\n" +
            "문의 내용:\n" + data.message + "\n\n" +
            "----------\n" +
            "첨부 파일:\n" + (fileLinks.length > 0 ? fileLinksString : "없음") + "\n\n" +
            "자세한 내용은 구글 시트를 확인하세요.";

        MailApp.sendEmail({
            to: "onandnoch@gmail.com", // 수신할 관리자 이메일
            subject: subject,
            body: body
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

function formatCurrency(val) {
    if (!val) return "0";
    return "₩" + parseInt(val).toLocaleString();
}
