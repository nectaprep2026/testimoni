(async function ($) {
    // toggle dark mode
    const toggleDarkMode = () => {
      const html = document.querySelector('html');
      html.setAttribute(
        'data-theme',
        html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark',
      );
      html.style.colorScheme = html.getAttribute('data-theme');
      localStorage.setItem('theme', html.getAttribute('data-theme'));
    };
  
    function formatSize(sizeInKB) {
      if (sizeInKB < 1024) {
        return Math.round(sizeInKB) + ' kB';
      } else {
        const sizeInMB = sizeInKB / 1024;
        return Math.round(sizeInMB) + ' MB';
      }
    }
  
    // toggle dark mode button
    const toggleDarkModeButton = document.querySelector('.toggle_button');
    toggleDarkModeButton.addEventListener('click', toggleDarkMode);
  
    // accordion
    $('.faqs__accordion__item__header').click(function () {
      $(this)
        .closest('.faqs__accordion__item')
        .toggleClass('active')
        .siblings()
        .removeClass('active');
      $(this)
        .closest('.faqs__accordion__item')
        .find('.faqs__accordion__item__body')
        .slideToggle('fast')
        .closest('.faqs__accordion__item')
        .siblings()
        .find('.faqs__accordion__item__body')
        .slideUp('fast');
    });
  
    //conatct form
    $('.contact__form').submit(function (e) {
      e.preventDefault();
      $(this).find('.btn').text('Sending...').attr('disabled', true);
  
      setTimeout(() => {
        $(this).find('.btn').text('Send').attr('disabled', false);
        $(this).find('.success__msg').show();
        $(this).find('input').val('');
        $(this).find('textarea').val('');
      }, 1000);
    });
  
    // active nav link
    const navItem = document.querySelectorAll('.header__menu_item');
    const path = window.location.pathname;
    navItem.forEach(item => {
      if (
        item.querySelector('a').getAttribute('href') === path ||
        `${item.querySelector('a').getAttribute('href')}/` === path
      ) {
        item.classList.add('active');
      }
    });
  
    // toggle menu
    $('.toogle_menu').on('click', function () {
      $('body').toggleClass('open__menu');
    });
  
    // close menu
    $('.close__overlay').on('click', function () {
      $('body').removeClass('open__menu');
    });
  
    const imageInput = document.getElementById('selectImage');
    const targetSize = document.getElementById('targetSize');
    const targetUnit = document.getElementById('targetUnit');
    const compressBtn = document.getElementById('compressBtn');
    const selectedImage = document.querySelector('.selected__image');
    const body = document.querySelector('body');
    const resultSection = document.querySelector('.result__section');
    const heroSection = document.querySelector('.hero__section');
    const downloadBtn = document.getElementById('downloadBtn');
    const comparisonWrapper = document.querySelector('.comparison__wrapper');
    const comparisonWrapper2 = document.querySelector('.comparison__wrapper2');
    const beforeSize = document.querySelector('.before__size');
    const afterSize = document.querySelector('.after__size');
  
    let imageType = '';
  
    if (targetUnit) {
      targetUnit.addEventListener('change', function () {
        if (targetUnit.value === 'percentage') {
          targetSize.value = 50;
        }
      });
    }
  
    if (imageInput) {
      imageInput.addEventListener('change', function (event) {
        if (!event.target.files) {
          return;
        }
        selectedImage.querySelector('img').src = URL.createObjectURL(
          event.target.files[0],
        );
        selectedImage.querySelector('.orignalSize').innerHTML = formatSize(
          event.target.files[0].size / 1024,
        );
        selectedImage.style.display = 'flex';
        comparisonWrapper.querySelector('.img1').src = URL.createObjectURL(
          event.target.files[0],
        );
        comparisonWrapper2.querySelector('.img1').src = URL.createObjectURL(
          event.target.files[0],
        );
  
        beforeSize.innerHTML = formatSize(event.target.files[0].size / 1024);
        imageType = event.target.files[0].type;
      });
  
      // handle drag and drop
      imageInput.addEventListener('dragenter', function (event) {
        event.preventDefault();
        event.stopPropagation();
        document.querySelector('.uploadBox').classList.add('dropHover');
      });
      imageInput.addEventListener('dragover', function (event) {
        event.preventDefault();
        event.stopPropagation();
        document.querySelector('.uploadBox').classList.add('dropHover');
      });
      imageInput.addEventListener('dragleave', function (event) {
        event.preventDefault();
        event.stopPropagation();
        document.querySelector('.uploadBox').classList.remove('dropHover');
      });
      imageInput.addEventListener('drop', function (event) {
        event.preventDefault();
        event.stopPropagation();
        document.querySelector('.uploadBox').classList.remove('dropHover');
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
          imageInput.files = event.dataTransfer.files;
          selectedImage.querySelector('img').src = URL.createObjectURL(
            event.dataTransfer.files[0],
          );
          selectedImage.querySelector('.orignalSize').innerHTML = formatSize(
            event.dataTransfer.files[0].size / 1024,
          );
          selectedImage.style.display = 'flex';
          comparisonWrapper.querySelector('.img1').src = URL.createObjectURL(
            event.dataTransfer.files[0],
          );
          comparisonWrapper2.querySelector('.img1').src = URL.createObjectURL(
            event.dataTransfer.files[0],
          );
  
          beforeSize.innerHTML = formatSize(
            event.dataTransfer.files[0].size / 1024,
          );
          imageType = event.dataTransfer.files[0].type;
        }
      });
    }
  
    async function compressImageToSize(file, targetSizeInBytes) {
      return new Promise(async (resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
  
        reader.onload = async function () {
          const img = new Image();
          img.src = reader.result;
  
          img.onload = async function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
  
            const initialWidth = img.width;
            const initialHeight = img.height;
  
            canvas.width = initialWidth;
            canvas.height = initialHeight;
  
            ctx.drawImage(img, 0, 0, initialWidth, initialHeight);
  
            let compressionQuality = 0.9; // Initial compression quality
  
            let compressedDataUrl = '';
            let currentSize = Infinity;
  
            while (
              compressedDataUrl.length === 0 ||
              (currentSize > targetSizeInBytes && compressionQuality > 0)
            ) {
              compressedDataUrl = canvas.toDataURL(
                imageType === 'image/png' ? 'image/png' : 'image/jpeg',
                compressionQuality,
              );
              currentSize = compressedDataUrl.length;
  
              if (currentSize > targetSizeInBytes) {
                if (compressionQuality > 0.1) {
                  compressionQuality -= 0.05; // Adjust quality by a fixed step
                } else if (
                  canvas.width > 100 &&
                  canvas.height > 100 &&
                  compressionQuality > 0
                ) {
                  canvas.width *= 0.9; // Decrease width by 10%
                  canvas.height *= 0.9; // Decrease height by 10%
  
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Redraw with new dimensions
                } else {
                  break; // Exit loop if minimum quality and resolution are reached
                }
              } else {
                // Exit loop if the size is within an acceptable range
                break;
              }
            }
  
            resolve(compressedDataUrl);
          };
  
          img.onerror = function (error) {
            reject(error);
          };
        };
  
        reader.onerror = function (error) {
          reject(error);
        };
      });
    }
  
    async function compressImageToSizeDataUri(dataUri, targetSizeInBytes) {
      return new Promise(async (resolve, reject) => {
        const img = new Image();
        img.src = dataUri;
  
        img.onload = async function () {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          const initialWidth = img.width;
          const initialHeight = img.height;
  
          canvas.width = initialWidth;
          canvas.height = initialHeight;
  
          ctx.drawImage(img, 0, 0, initialWidth, initialHeight);
  
          let compressionQuality = 0.9; // Initial compression quality
  
          let compressedDataUrl = '';
          let currentSize = Infinity;
  
          while (
            compressedDataUrl.length === 0 ||
            (currentSize > targetSizeInBytes && compressionQuality > 0)
          ) {
            compressedDataUrl = canvas.toDataURL(
              imageType === 'image/png' ? 'image/png' : 'image/jpeg',
              compressionQuality,
            );
            currentSize = compressedDataUrl.length;
  
            if (currentSize > targetSizeInBytes) {
              if (compressionQuality > 0.1) {
                compressionQuality -= 0.05; // Adjust quality by a fixed step
              } else if (
                canvas.width > 100 &&
                canvas.height > 100 &&
                compressionQuality > 0
              ) {
                canvas.width *= 0.9; // Decrease width by 10%
                canvas.height *= 0.9; // Decrease height by 10%
  
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Redraw with new dimensions
              } else {
                break; // Exit loop if minimum quality and resolution are reached
              }
            } else {
              // Exit loop if the size is within an acceptable range
              break;
            }
          }
  
          resolve(compressedDataUrl);
        };
  
        img.onerror = function (error) {
          reject(error);
        };
      });
    }
  
    async function compressImageToMaxQuality(file) {
      return new Promise(async (resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
  
        reader.onload = async function () {
          const img = new Image();
          img.src = reader.result;
  
          img.onload = async function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
  
            const initialWidth = img.width;
            const initialHeight = img.height;
  
            canvas.width = initialWidth;
            canvas.height = initialHeight;
  
            ctx.drawImage(img, 0, 0, initialWidth, initialHeight);
  
            let compressionQuality = 0.5;
  
            let compressedDataUrl = '';
  
            compressedDataUrl = canvas.toDataURL(
              imageType === 'image/png' ? 'image/png' : 'image/jpeg',
              compressionQuality,
            );
  
            resolve(compressedDataUrl);
          };
  
          img.onerror = function (error) {
            reject(error);
          };
        };
  
        reader.onerror = function (error) {
          reject(error);
        };
      });
    }
  
    if (compressBtn) {
      compressBtn.addEventListener('click', async function () {
        const selectedImage = imageInput.files[0];
  
        if (!selectedImage) {
          $.toast({
            icon: 'error',
            text: 'Please select an image',
            position: 'top-center',
            loaderBg: 'red',
            loader: false,
          });
          return;
        }
  
        if (
          parseInt(targetSize.value) === NaN ||
          parseInt(targetSize.value) === 0
        ) {
          $.toast({
            icon: 'error',
            text: 'Please enter a valid target size',
            position: 'top-center',
            loaderBg: 'red',
            loader: false,
          });
          return;
        }
  
        let desiredSizeKB = targetSize.value;
        if (targetUnit.value === 'mb') {
          desiredSizeKB *= 1024;
        }
  
        const orignalSize = selectedImage.size;
        const orignalSizeKB = orignalSize / 1024;
  
        if (orignalSizeKB < desiredSizeKB) {
          $.toast({
            icon: 'error',
            text: 'Image is already smaller than the target size',
            position: 'top-center',
            loaderBg: 'red',
            loader: false,
          });
          return;
        }
  
        const desiredSize = desiredSizeKB * 1024;
        let compressedDataUrl;
  
        body.classList.add('loading__compressing');
        compressBtn.disabled = true;
        compressBtn.innerHTML = 'Compressing...';
  
        if (selectedImage && desiredSize) {
          compressedDataUrl = await compressImageToSize(
            selectedImage,
            desiredSize,
          );
        } else if (selectedImage) {
          compressedDataUrl = await compressImageToMaxQuality(selectedImage);
        }
  
        comparisonWrapper.querySelector('.img2').src = compressedDataUrl;
        comparisonWrapper2.querySelector('.img2').src = compressedDataUrl;
        afterSize.innerHTML = formatSize(compressedDataUrl.length / 1024);
        const compressionRatio = (compressedDataUrl.length / orignalSize) * 100;
        document.querySelector('.compressed_line').style.width =
          compressionRatio + '%';
        new ImageCompare(comparisonWrapper).mount();
        new ImageCompare(comparisonWrapper2).mount();
  
        heroSection.style.display = 'none';
        resultSection.style.display = 'block';
  
        body.classList.remove('loading__compressing');
        compressBtn.innerHTML = 'Compress';
        compressBtn.disabled = false;
      });
    }
  
    if (downloadBtn) {
      downloadBtn.addEventListener('click', function () {
        const a = document.createElement('a');
        a.href = comparisonWrapper.querySelector('.img2').src;
        a.download = 'compressed_' + imageInput.files[0].name;
        a.click();
      });
    }
  
    document.querySelector('#resetBtn').addEventListener('click', function () {
      window.location.reload();
    });
  
    if (document.querySelector('.toogle__full__comparison')) {
      document
        .querySelector('.toogle__full__comparison')
        .addEventListener('click', function () {
          document.querySelector('.comparison__modal').classList.toggle('active');
        });
    }
  
    document
      .querySelector('.comparison__modal .overlay')
      .addEventListener('click', function () {
        document.querySelector('.comparison__modal').classList.remove('active');
      });
  
    // compress pdf
    const pdfInput = document.getElementById('selectPDF');
    const compressPdfBtn = document.getElementById('compressPDF');
    const selectedPdf = document.querySelector('.selected__image');
    const pdfDownloadBtn = document.getElementById('pdfDownloadBtn');
    let downloadPdfResult;
    let fileName;
  
    if (pdfInput) {
      pdfInput.addEventListener('change', async function (event) {
        if (!event.target.files) {
          return;
        }
  
        compressPdfBtn.setAttribute('disabled', true);
        compressPdfBtn.innerHTML = 'Please wait...';
        body.classList.add('loading__compressing');
  
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
  
        const pdf = await pdfjsLib.getDocument(
          URL.createObjectURL(event.target.files[0]),
        ).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };
        page.render(renderContext).promise.then(function () {
          const pdfAsBase64 = canvas.toDataURL('image/jpeg', 0.5);
          selectedPdf.querySelector('img').src = pdfAsBase64;
          resultSection.querySelector('img').src = pdfAsBase64;
          selectedPdf.querySelector('.orignalSize').innerHTML = formatSize(
            event.target.files[0].size / 1024,
          );
          selectedPdf.style.display = 'flex';
  
          compressPdfBtn.removeAttribute('disabled');
          compressPdfBtn.innerHTML = 'Compress PDF';
          body.classList.remove('loading__compressing');
        });
      });
    }
  
    if (compressPdfBtn) {
      compressPdfBtn.addEventListener('click', async function () {
        const selectedPdfFile = pdfInput.files[0];
  
        if (!selectedPdfFile) {
          $.toast({
            icon: 'error',
            text: 'Please select a PDF',
            position: 'top-center',
            loaderBg: 'red',
            loader: false,
          });
          return;
        }
  
        let desiredSizeKB = targetSize.value;
        if (
          parseInt(targetSize.value) === NaN ||
          parseInt(targetSize.value) === 0
        ) {
          desiredSizeKB = null;
        }
  
        if (targetUnit.value === 'mb' && desiredSizeKB) {
          desiredSizeKB *= 1024;
        }
  
        if (targetUnit.value === 'percentage') {
          desiredSizeKB = null;
          if (targetSize.value > 100 || targetSize.value < 1) {
            $.toast({
              icon: 'error',
              text: 'Please enter a valid target size',
              position: 'top-center',
              loaderBg: 'red',
              loader: false,
            });
            return;
          }
        }
  
        compressPdfBtn.setAttribute('disabled', true);
        compressPdfBtn.innerHTML = 'Compressing...';
        body.classList.add('loading__compressing');
  
        const pdf = await pdfjsLib.getDocument(
          URL.createObjectURL(selectedPdfFile),
        ).promise;
        const allPages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
          };
  
          page.render(renderContext).promise.then(async function () {
            let pdfAsBase64 = null;
  
            if (desiredSizeKB) {
              pdfAsBase64 = await compressImageToSizeDataUri(
                canvas.toDataURL('image/jpeg', 1),
                (desiredSizeKB / pdf.numPages) * 1024,
              );
            } else {
              let compressionQuality = 0.8; // Initial compression quality
  
              if (targetUnit.value === 'percentage') {
                compressionQuality = (100 - targetSize.value) / 100;
              }
  
              pdfAsBase64 = canvas.toDataURL('image/jpeg', compressionQuality);
            }
            allPages.push({
              data: pdfAsBase64,
              height: viewport.height,
              width: viewport.width,
            });
  
            if (allPages.length === pdf.numPages) {
              const { PDFDocument } = PDFLib;
              const newPdf = await PDFDocument.create();
              for (let i = 0; i < allPages.length; i++) {
                const img = await newPdf.embedJpg(allPages[i].data);
                const page = newPdf.addPage();
                page.setSize(allPages[i].width, allPages[i].height);
                page.drawImage(img, {
                  x: 0,
                  y: 0,
                  width: allPages[i].width,
                  height: allPages[i].height,
                });
              }
  
              const pdfBytes = await newPdf.save();
              const pdfAsBase64 = URL.createObjectURL(
                new Blob([pdfBytes], { type: 'application/pdf' }),
              );
  
              downloadPdfResult = pdfAsBase64;
              fileName = 'compressed_' + selectedPdfFile.name;
  
              heroSection.style.display = 'none';
              resultSection.style.display = 'block';
              beforeSize.innerHTML = formatSize(selectedPdfFile.size / 1024);
              afterSize.innerHTML = formatSize(pdfBytes.length / 1024);
              const compressionRatio =
                ((pdfBytes.length / 1024) * 100) / (selectedPdfFile.size / 1024);
              document.querySelector('.compressed_line').style.width =
                compressionRatio + '%';
  
              compressPdfBtn.removeAttribute('disabled');
              compressPdfBtn.innerHTML = 'Compress PDF';
              body.classList.remove('loading__compressing');
  
              $.toast({
                icon: 'success',
                text: 'PDF compressed successfully',
                position: 'top-center',
                loaderBg: 'green',
                loader: false,
              });
  
              pdfInput.value = '';
              targetSize.value = '';
              selectedPdf.querySelector('img').src = '';
              selectedPdf.querySelector('.orignalSize').innerHTML = '';
              selectedPdf.style.display = 'none';
            }
          });
        }
      });
    }
  
    if (pdfDownloadBtn) {
      pdfDownloadBtn.addEventListener('click', function () {
        const a = document.createElement('a');
        a.href = downloadPdfResult;
        a.download = fileName;
        a.click();
      });
    }
  
    $('.has__submenu .arrow_down').click(function () {
      $(this).parent().toggleClass('active').siblings('.has__submenu').removeClass('active');
      $(this).parent().siblings('.has__submenu').find('.header__menu_dropdown').slideUp();
      $(this).parent().find('.header__menu_dropdown').slideToggle();
    });
  })(jQuery);