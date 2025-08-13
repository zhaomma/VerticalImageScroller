document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const selectFolderBtn = document.getElementById('selectFolder');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const autoPlayCheckbox = document.getElementById('autoPlay');
    const intervalInput = document.getElementById('interval');
    const resetBtn = document.getElementById('resetBtn');
    const currentImage = document.getElementById('currentImage');
    const imageCounter = document.getElementById('imageCounter');
    const imageName = document.getElementById('imageName');

    // 应用状态
    let imageFiles = [];
    let currentIndex = 0;
    let autoPlayInterval = null;
    let lastFolderPath = '';

    // 尝试从本地存储加载状态
    loadState();

    // 事件监听器
    selectFolderBtn.addEventListener('click', selectFolder);
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);
    autoPlayCheckbox.addEventListener('change', toggleAutoPlay);
    intervalInput.addEventListener('change', updateAutoPlayInterval);
    resetBtn.addEventListener('click', resetApp);

    // 选择文件夹
    function selectFolder() {
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.multiple = true;

        input.addEventListener('change', function(e) {
            imageFiles = Array.from(e.target.files)
                .filter(file => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name))
                .sort((a, b) => a.name.localeCompare(b.name));

            if (imageFiles.length > 0) {
                currentIndex = 0;
                lastFolderPath = e.target.files[0].webkitRelativePath.split('/')[0];
                showCurrentImage();
                enableNavigationButtons();
                saveState();
            } else {
                alert('未找到图像文件！');
            }
        });

        input.click();
    }

    // 显示上一张图像
    function showPrevImage() {
        if (imageFiles.length === 0) return;

        currentIndex = (currentIndex - 1 + imageFiles.length) % imageFiles.length;
        showCurrentImage();
        saveState();
    }

    // 显示下一张图像
    function showNextImage() {
        if (imageFiles.length === 0) return;

        currentIndex = (currentIndex + 1) % imageFiles.length;
        showCurrentImage();
        saveState();
    }

    // 显示当前图像
    function showCurrentImage() {
        if (imageFiles.length === 0 || currentIndex >= imageFiles.length) return;

        const file = imageFiles[currentIndex];
        const objectURL = URL.createObjectURL(file);

        // 释放之前的对象URL以避免内存泄漏
        if (currentImage.src) {
            URL.revokeObjectURL(currentImage.src);
        }

        currentImage.src = objectURL;
        currentImage.alt = file.name;
        imageCounter.textContent = `${currentIndex + 1}/${imageFiles.length}`;
        imageName.textContent = file.name;

        // 滚动到图像顶部
        currentImage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 启用导航按钮
    function enableNavigationButtons() {
        prevBtn.disabled = false;
        nextBtn.disabled = false;
    }

    // 禁用导航按钮
    function disableNavigationButtons() {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
    }

    // 切换自动播放
    function toggleAutoPlay() {
        if (autoPlayCheckbox.checked) {
            startAutoPlay();
        } else {
            stopAutoPlay();
        }
        saveState();
    }

    // 开始自动播放
    function startAutoPlay() {
        if (imageFiles.length === 0) return;

        stopAutoPlay(); // 确保没有其他定时器在运行

        const interval = parseInt(intervalInput.value) * 1000;
        autoPlayInterval = setInterval(showNextImage, interval);
    }

    // 停止自动播放
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    // 更新自动播放间隔
    function updateAutoPlayInterval() {
        if (autoPlayCheckbox.checked) {
            startAutoPlay();
        }
        saveState();
    }

    // 重置应用
    function resetApp() {
        stopAutoPlay();
        autoPlayCheckbox.checked = false;
        intervalInput.value = 3;
        imageFiles = [];
        currentIndex = 0;
        currentImage.src = '';
        currentImage.alt = '选择文件夹以查看图像';
        imageCounter.textContent = '0/0';
        imageName.textContent = '未选择图像';
        disableNavigationButtons();
        localStorage.removeItem('verticalImageScrollerState');
    }

    // 保存状态到本地存储
    function saveState() {
        const state = {
            lastFolderPath: lastFolderPath,
            currentIndex: currentIndex,
            autoPlay: autoPlayCheckbox.checked,
            interval: intervalInput.value
        };
        localStorage.setItem('verticalImageScrollerState', JSON.stringify(state));
    }

    // 从本地存储加载状态
    function loadState() {
        const stateJson = localStorage.getItem('verticalImageScrollerState');
        if (stateJson) {
            try {
                const state = JSON.parse(stateJson);
                lastFolderPath = state.lastFolderPath || '';
                autoPlayCheckbox.checked = state.autoPlay || false;
                intervalInput.value = state.interval || 3;

                // 注意：出于安全原因，我们不能自动重新选择文件夹
                // 用户必须手动选择文件夹
            } catch (error) {
                console.error('Failed to load state:', error);
            }
        }
    }
});