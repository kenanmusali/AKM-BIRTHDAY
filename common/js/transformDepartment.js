  function transformDepartment(jobOriginal) {
            const jobReplaceList = [
                "BBGİ ofisi",
                "Bəyannamə bölməsi",
                "Gömrük təmsilçiliyi bölməsi",
                "HNBGİ ofisi",
                "Koordinasiya şöbəsi",
                "Koordinasiya şöbəsi / Sertifikatlaşdırma bölməsi",
                "Mühasibatlıq şöbəsi",
                "MB Broker",
                "Əməliyyat şöbəsi",
                "Mühasibatlıq şöbəsi / Kassa - hesablaşmalar bölməsi",
                "Satış şöbəsi",
            ];

            if (jobOriginal === "TIR Park və minik avtomobillərinin dayanacağı şöbəsi") {
                return ["TIR Park və m. a. dayanacağı şöbəsi"];
            } else if (jobOriginal.startsWith("DDD / Daxili daşımalar departamenti")) {
                return ["Daxili daşımalar departamenti"];
            } else if (jobOriginal.startsWith("Təhlükəsizlik şöbəsi / Elektrik təminatı və Təmir bölməsi")) {
                return ["Təhlükəsizlik şöbəsi"];
            } else if (jobOriginal.startsWith("ƏKTD / Sistem əməliyyaları şöbəsi (UDPAS)")) {
                return ["ƏKTD / Sistem əməliyyaları şöbəsi"];
            } else if (jobOriginal.startsWith("İRİD/İstedadların cəlbi və idarə olunması şöbəsi")) {
                return ["İRİD / İstedadların cəlbi və idarə olunması Ş."];
            } else if (jobOriginal.startsWith("ƏKTD / Anbar əməliyyatları şöbəsi (WMS)")) {
                return ["ƏKTD / Anbar əməliyyatları şöbəsi"];
            } else if (jobOriginal.startsWith("Əməliyyat şöbəsi")) {
                return ["Abşeron Express"];
            } else if (jobOriginal.startsWith("İRİD / İnsan resursları və inzibati departament")) {
                return ["İRİD / İnsan resursları və inzibati D."];
                
            } else if (jobReplaceList.some(prefix => jobOriginal.startsWith(prefix))) {
                return ["MB BROKER"];
            } else {
                return [jobOriginal];
            }
        }
