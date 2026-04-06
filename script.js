/* ═══════════════════════════════════════════════════════════════
   MULTICONVERT PRO — CONTROLLER ENGINE
   Dark Glassmorphic Edition — Public Access (No Auth)
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // ─── DOM References ───
    const menuItems = document.querySelectorAll('.menu-item');
    const viewHome = document.getElementById('viewHome');
    const viewTool = document.getElementById('viewTool');
    const topbarTitle = document.getElementById('topbarTitle');
    const btnConnectionStatus = document.getElementById('btnConnectionStatus');

    // Mobile
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // Home elements
    const homeDropzone = document.getElementById('homeDropzone');
    const homeFileInput = document.getElementById('homeFileInput');
    const homeSettings = document.getElementById('homeSettings');
    const homeFilesList = document.getElementById('homeFilesList');
    const btnHomeClear = document.getElementById('btnHomeClear');
    const btnHomeProcess = document.getElementById('btnHomeProcess');
    const homeProgressSection = document.getElementById('homeProgressSection');
    const homeProgressBar = document.getElementById('homeProgressBar');
    const homeStatusIndicator = document.getElementById('homeStatusIndicator');
    const homeStatusTitle = document.getElementById('homeStatusTitle');
    const homeStatusDesc = document.getElementById('homeStatusDesc');
    const homeSuccessActions = document.getElementById('homeSuccessActions');
    const btnHomeDownload = document.getElementById('btnHomeDownload');

    // Tool elements
    const currentToolTitle = document.getElementById('currentToolTitle');
    const toolDropzone = document.getElementById('toolDropzone');
    const toolFileInput = document.getElementById('toolFileInput');
    const toolSettings = document.getElementById('toolSettings');
    const toolFilesList = document.getElementById('toolFilesList');
    const btnToolClear = document.getElementById('btnToolClear');
    const btnToolProcess = document.getElementById('btnToolProcess');
    const optRanges = document.getElementById('opt-ranges');
    const optPassword = document.getElementById('opt-password');
    const optWatermark = document.getElementById('opt-watermark');
    const inputPageRange = document.getElementById('inputPageRange');
    const inputPdfPassword = document.getElementById('inputPdfPassword');
    const inputWatermarkText = document.getElementById('inputWatermarkText');
    const toolProgressSection = document.getElementById('toolProgressSection');
    const toolProgressBar = document.getElementById('toolProgressBar');
    const toolStatusIndicator = document.getElementById('toolStatusIndicator');
    const toolStatusTitle = document.getElementById('toolStatusTitle');
    const toolStatusDesc = document.getElementById('toolStatusDesc');
    const toolSuccessActions = document.getElementById('toolSuccessActions');
    const btnToolDownload = document.getElementById('btnToolDownload');

    // ─── State ───
    let currentActiveTool = 'home';
    let homeFiles = [];
    let toolFiles = [];
    let homeDownloadUrl = null;
    let toolDownloadUrl = null;
    let fallbackFileName = 'download.pdf';

    const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB limit

    // ═══════════════════════════════════════
    // TOAST NOTIFICATION SYSTEM
    // ═══════════════════════════════════════
    const toastContainer = document.getElementById('toastContainer');

    function showToast(message, type = 'info', duration = 4000) {
        const icons = {
            success: 'bx-check-circle',
            error: 'bx-error-circle',
            info: 'bx-info-circle'
        };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class='bx ${icons[type] || icons.info}'></i><span>${escapeHtml(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // ─── Utilities ───
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatBytes(b) {
        if (b === 0) return '0 Bytes';
        const i = Math.floor(Math.log(b) / Math.log(1024));
        return parseFloat((b / Math.pow(1024, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    }

    // ═══════════════════════════════════════
    // MOBILE SIDEBAR TOGGLE
    // ═══════════════════════════════════════
    function openSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
        mobileMenuToggle.innerHTML = "<i class='bx bx-x'></i>";
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
        mobileMenuToggle.innerHTML = "<i class='bx bx-menu'></i>";
    }

    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    sidebarOverlay.addEventListener('click', closeSidebar);

    // ═══════════════════════════════════════
    // NAVIGATION
    // ═══════════════════════════════════════
    menuItems.forEach(item => {
        if (item.classList.contains('menu-label')) return;
        item.addEventListener('click', () => {
            menuItems.forEach(m => m.classList.remove('active'));
            item.classList.add('active');

            const target = item.getAttribute('data-target');
            if (target === 'home') {
                currentActiveTool = 'home';
                topbarTitle.textContent = "Chuyển đổi Đa Năng";
                viewTool.style.display = 'none';
                viewHome.style.display = 'block';
                viewHome.classList.add('active');
            } else {
                currentActiveTool = item.getAttribute('data-tool');
                const titleStr = item.getAttribute('data-title');

                topbarTitle.textContent = titleStr;
                currentToolTitle.textContent = titleStr;

                // Hide all dynamic options first
                [optRanges, optPassword, optWatermark].forEach(el => el.style.display = 'none');

                // Show relevant options
                if (['split', 'remove_pages', 'extract', 'media_trim'].includes(currentActiveTool)) {
                    optRanges.style.display = 'block';
                }
                if (['protect', 'unlock'].includes(currentActiveTool)) {
                    optPassword.style.display = 'block';
                }
                if (['watermark', 'img_watermark', 'qr_generator', 'sign', 'redact', 'ai_tts'].includes(currentActiveTool)) {
                    optWatermark.style.display = 'block';
                    const lbl = optWatermark.querySelector('label');
                    if (currentActiveTool === 'qr_generator') lbl.textContent = "Dữ liệu mã QR (Link/Text)";
                    else if (currentActiveTool === 'sign') lbl.textContent = "Nội dung chữ ký";
                    else if (currentActiveTool === 'redact') lbl.textContent = "Văn bản cần biên tập (tẩy đen)";
                    else if (currentActiveTool === 'ai_tts') lbl.textContent = "Nội dung đọc thành tiếng";
                    else lbl.textContent = "Nội dung bản quyền (Watermark)";
                }

                if (currentActiveTool === 'media_trim') {
                    optRanges.querySelector('label').textContent = "Khoảng thời gian cắt (Giây, vd: 10-30)";
                } else if (optRanges.style.display !== 'none') {
                    optRanges.querySelector('label').textContent = "Khoảng trang cắt (Ví dụ: 1-5)";
                }

                clearToolFiles();
                viewHome.style.display = 'none';
                viewTool.style.display = 'block';
                viewTool.classList.add('active');
            }

            // Close mobile sidebar after selection
            closeSidebar();
        });
    });

    // ═══════════════════════════════════════
    // FILE HANDLING — HOME
    // ═══════════════════════════════════════
    function validateFiles(files) {
        for (let f of files) {
            if (f.size > MAX_FILE_SIZE) {
                showToast(`${f.name} vượt quá giới hạn 200MB`, 'error');
                return false;
            }
        }
        return true;
    }

    function doHomeHandleFiles(files) {
        if (files.length > 0 && validateFiles(files)) {
            for (let f of files) homeFiles.push(f);
            homeDropzone.classList.remove('active');
            homeSettings.classList.add('active');
            renderHomeFiles();
            showToast(`Đã thêm ${files.length} tệp`, 'success', 2000);
        }
    }

    homeDropzone.addEventListener('click', () => homeFileInput.click());
    homeFileInput.addEventListener('change', function () { doHomeHandleFiles(this.files); this.value = ''; });

    // Drag & drop
    ['dragenter', 'dragover'].forEach(ev => homeDropzone.addEventListener(ev, e => {
        e.preventDefault(); e.stopPropagation();
        homeDropzone.classList.add('dragover');
    }));
    ['dragleave', 'drop'].forEach(ev => homeDropzone.addEventListener(ev, e => {
        e.preventDefault(); e.stopPropagation();
        homeDropzone.classList.remove('dragover');
    }));
    homeDropzone.addEventListener('drop', e => doHomeHandleFiles(e.dataTransfer.files));

    function clearHomeFiles() {
        homeFiles = [];
        if (homeDownloadUrl) { URL.revokeObjectURL(homeDownloadUrl); homeDownloadUrl = null; }
        homeSettings.classList.remove('active');
        homeProgressSection.classList.remove('active');
        homeDropzone.classList.add('active');
    }
    btnHomeClear.addEventListener('click', clearHomeFiles);

    function renderHomeFiles() {
        homeFilesList.innerHTML = '';
        if (homeFiles.length === 0) return clearHomeFiles();
        homeFiles.forEach((f, i) => {
            const div = document.createElement('div');
            div.className = 'file-preview-item';
            div.innerHTML = `
                <i class='bx bx-file file-icon'></i>
                <div class="file-info"><div class="file-name">${escapeHtml(f.name)}</div><div class="file-meta">${formatBytes(f.size)}</div></div>
                <button class="btn-remove-file" data-idx="${i}"><i class='bx bx-trash'></i></button>
            `;
            homeFilesList.appendChild(div);
        });
        document.querySelectorAll('#homeFilesList .btn-remove-file').forEach(btn => {
            btn.addEventListener('click', e => {
                homeFiles.splice(parseInt(e.currentTarget.getAttribute('data-idx')), 1);
                renderHomeFiles();
            });
        });
    }

    // ═══════════════════════════════════════
    // FILE HANDLING — TOOL
    // ═══════════════════════════════════════
    function doToolHandleFiles(files) {
        if (files.length > 0 && validateFiles(files)) {
            for (let f of files) toolFiles.push(f);
            toolDropzone.classList.remove('active');
            toolSettings.classList.add('active');
            renderToolFiles();
            showToast(`Đã thêm ${files.length} tệp`, 'success', 2000);
        }
    }

    toolDropzone.addEventListener('click', () => toolFileInput.click());
    toolFileInput.addEventListener('change', function () { doToolHandleFiles(this.files); this.value = ''; });

    ['dragenter', 'dragover'].forEach(ev => toolDropzone.addEventListener(ev, e => {
        e.preventDefault(); e.stopPropagation();
        toolDropzone.classList.add('dragover');
    }));
    ['dragleave', 'drop'].forEach(ev => toolDropzone.addEventListener(ev, e => {
        e.preventDefault(); e.stopPropagation();
        toolDropzone.classList.remove('dragover');
    }));
    toolDropzone.addEventListener('drop', e => doToolHandleFiles(e.dataTransfer.files));

    function clearToolFiles() {
        toolFiles = [];
        if (toolDownloadUrl) { URL.revokeObjectURL(toolDownloadUrl); toolDownloadUrl = null; }
        toolSettings.classList.remove('active');
        toolProgressSection.classList.remove('active');
        toolDropzone.classList.add('active');
    }
    btnToolClear.addEventListener('click', clearToolFiles);

    function renderToolFiles() {
        toolFilesList.innerHTML = '';
        if (toolFiles.length === 0) return clearToolFiles();
        toolFiles.forEach((f, i) => {
            const div = document.createElement('div');
            div.className = 'file-preview-item';
            div.innerHTML = `
                <i class='bx bx-file file-icon'></i>
                <div class="file-info"><div class="file-name">${escapeHtml(f.name)}</div><div class="file-meta">${formatBytes(f.size)}</div></div>
                <button class="btn-remove-file" data-idx="${i}"><i class='bx bx-trash'></i></button>
            `;
            toolFilesList.appendChild(div);
        });
        document.querySelectorAll('#toolFilesList .btn-remove-file').forEach(btn => {
            btn.addEventListener('click', e => {
                toolFiles.splice(parseInt(e.currentTarget.getAttribute('data-idx')), 1);
                renderToolFiles();
            });
        });
    }

    // ═══════════════════════════════════════
    // PROCESSING ENGINE (Hybrid Local + Backend)
    // ═══════════════════════════════════════
    async function processFiles(action, context) {
        let filesArr, setSec, progSec, pBar, pIndic, tTitle, tDesc, sActs;
        let formData = new FormData();
        let useClientFallback = false;

        if (context === 'home') {
            filesArr = homeFiles; setSec = homeSettings; progSec = homeProgressSection;
            pBar = homeProgressBar; tTitle = homeStatusTitle; tDesc = homeStatusDesc;
            sActs = homeSuccessActions; pIndic = homeStatusIndicator;
            const targetFmt = document.querySelector('input[name="target_format"]:checked').value;
            formData.append('tool', 'convert_general');
            formData.append('target_format', targetFmt);
        } else {
            filesArr = toolFiles; setSec = toolSettings; progSec = toolProgressSection;
            pBar = toolProgressBar; tTitle = toolStatusTitle; tDesc = toolStatusDesc;
            sActs = toolSuccessActions; pIndic = toolStatusIndicator;
            formData.append('tool', currentActiveTool);
            if (optRanges.style.display !== 'none') formData.append('ranges', inputPageRange.value);
            if (optPassword.style.display !== 'none') formData.append('password', inputPdfPassword.value);
            if (optWatermark.style.display !== 'none') formData.append('watermark', inputWatermarkText.value);
        }

        if (filesArr.length === 0) {
            showToast("Vui lòng chọn ít nhất 1 tệp!", 'error');
            return;
        }

        filesArr.forEach(f => formData.append('files', f));

        // ─── Show progress ───
        setSec.classList.remove('active');
        progSec.classList.add('active');
        pBar.style.width = '10%';
        pBar.style.background = 'linear-gradient(90deg, #6366f1, #22d3ee)';
        tDesc.style.color = '';
        pIndic.innerHTML = '<div class="spinner"></div>';
        sActs.classList.remove('active');
        tTitle.textContent = "Khởi tạo tiến trình...";

        const toolDescMap = {
            'ai_summarize': 'Đang đọc và tóm tắt bằng AI...',
            'img_remove_bg': 'AI đang tách nền ảnh...',
            'video_to_mp3': 'Đang trích xuất âm thanh từ Video...',
            'pdf_to_word': 'Đang chuyển cấu trúc PDF sang Word...',
            'json_to_csv': 'Đang tái cấu trúc dữ liệu...',
            'qr_generator': 'Đang tạo mã QR...',
            'heic_to_jpg': 'Đang chuyển đổi định dạng ảnh Apple...',
            'merge': 'Đang nối các tệp PDF...',
            'split': 'Đang tách PDF theo khoảng trang...',
            'compress': 'Đang nén tối ưu PDF...',
            'watermark': 'Đang chèn dấu bản quyền...',
            'word_to_pdf': 'Đang chuyển Word sang PDF...',
            'excel_to_pdf': 'Đang chuyển Excel sang PDF...',
            'ppt_to_pdf': 'Đang chuyển PowerPoint sang PDF...',
            'ai_tts': 'Đang chuyển văn bản thành giọng nói...'
        };
        tDesc.textContent = toolDescMap[currentActiveTool] || "Đang gửi dữ liệu tới máy chủ xử lý...";

        try {
            let blobData = null;

            // ─── STEP 1: Try Backend API ───
            try {
                pBar.style.width = '30%';
                tDesc.textContent = "Đang kết nối tới Backend API...";

                const isLocalApp = window.location.protocol === 'file:';
                const apiUrl = isLocalApp
                    ? "http://127.0.0.1:58085/api/process"
                    : "https://convert-api-pw18.onrender.com/api/process";

                const response = await fetch(apiUrl, {
                    method: "POST",
                    body: formData,
                    signal: AbortSignal.timeout(120000) // 2 min timeout
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || "Backend response error");
                }

                pBar.style.width = '80%';
                const cd = response.headers.get("Content-Disposition");
                fallbackFileName = cd && cd.includes("filename=")
                    ? cd.split("filename=")[1].replace(/"/g, '')
                    : "result_" + filesArr[0].name;
                blobData = await response.blob();

                // Update connection status
                btnConnectionStatus.className = 'connection-badge';
                btnConnectionStatus.innerHTML = "<i class='bx bx-wifi'></i><span>Server Online</span>";

            } catch (backendError) {
                tDesc.textContent = "Backend không phản hồi — chuyển sang Offline Mode...";
                useClientFallback = true;
                btnConnectionStatus.className = 'connection-badge offline';
                btnConnectionStatus.innerHTML = "<i class='bx bx-wifi-off'></i><span>Offline Mode</span>";
            }

            // ─── STEP 2: Client Fallback (pdf-lib) ───
            if (useClientFallback) {
                if (!window.PDFLib) throw new Error("Chưa tải được thư viện Offline (pdf-lib).");
                pBar.style.width = '50%';

                const PDFLib = window.PDFLib;
                let finalBytes = null;

                if (currentActiveTool === 'merge' || (context === 'home' && document.querySelector('input[name="target_format"]:checked')?.value === 'pdf')) {
                    const mergedPdf = await PDFLib.PDFDocument.create();
                    for (let f of filesArr) {
                        try {
                            const pdf = await PDFLib.PDFDocument.load(await f.arrayBuffer());
                            const copied = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                            copied.forEach(p => mergedPdf.addPage(p));
                        } catch { /* skip non-PDF files */ }
                    }
                    finalBytes = await mergedPdf.save();
                    fallbackFileName = "merged.pdf";
                }
                else if (currentActiveTool === 'protect') {
                    const pw = inputPdfPassword.value;
                    if (!pw) throw new Error("Vui lòng nhập mật khẩu bảo vệ.");
                    const pdf = await PDFLib.PDFDocument.load(await filesArr[0].arrayBuffer());
                    pdf.encrypt({ userPassword: pw, ownerPassword: pw + "_admin" });
                    finalBytes = await pdf.save();
                    fallbackFileName = "protected.pdf";
                }
                else if (currentActiveTool === 'split' || currentActiveTool === 'extract') {
                    const rng = inputPageRange.value.split('-').map(Number);
                    const pdf = await PDFLib.PDFDocument.load(await filesArr[0].arrayBuffer());
                    const newPdf = await PDFLib.PDFDocument.create();
                    let s = (rng[0] || 1) - 1;
                    let e = (rng[1] || rng[0] || 1) - 1;
                    let indices = [];
                    for (let i = s; i <= e && i < pdf.getPageCount(); i++) indices.push(i);
                    const copied = await newPdf.copyPages(pdf, indices);
                    copied.forEach(p => newPdf.addPage(p));
                    finalBytes = await newPdf.save();
                    fallbackFileName = currentActiveTool + ".pdf";
                }
                else if (currentActiveTool === 'remove_pages') {
                    const rng = inputPageRange.value.split('-').map(Number);
                    const pdf = await PDFLib.PDFDocument.load(await filesArr[0].arrayBuffer());
                    const newPdf = await PDFLib.PDFDocument.create();
                    let s = (rng[0] || 1) - 1;
                    let e = (rng[1] || rng[0] || 1) - 1;
                    let indices = [];
                    for (let i = 0; i < pdf.getPageCount(); i++) {
                        if (i < s || i > e) indices.push(i);
                    }
                    const copied = await newPdf.copyPages(pdf, indices);
                    copied.forEach(p => newPdf.addPage(p));
                    finalBytes = await newPdf.save();
                    fallbackFileName = "removed_pages.pdf";
                }
                else if (currentActiveTool === 'rotate') {
                    const pdf = await PDFLib.PDFDocument.load(await filesArr[0].arrayBuffer());
                    const pages = pdf.getPages();
                    pages.forEach(p => p.setRotation(PDFLib.degrees(p.getRotation().angle + 90)));
                    finalBytes = await pdf.save();
                    fallbackFileName = "rotated.pdf";
                }
                else {
                    throw new Error("Tính năng này YÊU CẦU Backend Python đang chạy. Vui lòng khởi động Backend để sử dụng!");
                }

                blobData = new Blob([finalBytes], { type: 'application/pdf' });
            }

            // ─── SUCCESS ───
            const url = URL.createObjectURL(blobData);
            if (context === 'home') homeDownloadUrl = url; else toolDownloadUrl = url;

            pBar.style.width = '100%';
            setTimeout(() => {
                pIndic.innerHTML = "<i class='bx bxs-check-circle' style='font-size:3.2rem;color:var(--accent-emerald);'></i>";
                tTitle.textContent = useClientFallback ? 'Hoàn tất (Offline Mode)' : 'Hoàn tất thành công!';
                tDesc.style.color = 'var(--accent-emerald)';
                tDesc.textContent = "Tệp đã sẵn sàng tải về.";
                sActs.classList.add('active');
                showToast("Xử lý hoàn tất — sẵn sàng tải về!", 'success');
            }, 500);

        } catch (error) {
            pBar.style.width = '100%';
            pBar.style.background = 'var(--accent-rose)';
            pIndic.innerHTML = "<i class='bx bxs-error-circle' style='font-size:3.2rem;color:var(--accent-rose);'></i>";
            tTitle.textContent = 'Có lỗi xảy ra';
            tDesc.style.color = 'var(--accent-rose)';
            tDesc.textContent = error.message;
            showToast(error.message, 'error', 6000);
        }
    }

    btnHomeProcess.addEventListener('click', () => processFiles('convert_general', 'home'));
    btnToolProcess.addEventListener('click', () => processFiles(currentActiveTool, 'tool'));

    // ═══════════════════════════════════════
    // DOWNLOAD HANDLER
    // ═══════════════════════════════════════
    function triggerDownload(url) {
        if (url) {
            const a = document.createElement('a');
            a.href = url;
            a.download = fallbackFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showToast(`Đang tải: ${fallbackFileName}`, 'info', 3000);
        }
    }

    btnHomeDownload.addEventListener('click', () => triggerDownload(homeDownloadUrl));
    btnToolDownload.addEventListener('click', () => triggerDownload(toolDownloadUrl));

    // ═══════════════════════════════════════
    // KEYBOARD SHORTCUT
    // ═══════════════════════════════════════
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeSidebar();
    });

    // ─── Initial connection check ───
    (async () => {
        try {
            const isLocal = window.location.protocol === 'file:';
            const url = isLocal ? "http://127.0.0.1:58085/docs" : "https://convert-api-pw18.onrender.com/docs";
            const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
            if (res.ok) {
                btnConnectionStatus.className = 'connection-badge';
                btnConnectionStatus.innerHTML = "<i class='bx bx-wifi'></i><span>Server Online</span>";
            }
        } catch {
            // Stay in offline mode
        }
    })();
});
