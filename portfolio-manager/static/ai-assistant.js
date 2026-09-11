(() => {
    const source = document.querySelector('#source_text');
    const counter = document.querySelector('[data-source-count]');

    function updateSourceCount() {
        if (!source || !counter) return;
        const max = Number(source.getAttribute('maxlength') || 0);
        counter.textContent = `${source.value.length.toLocaleString()} / ${max.toLocaleString()}`;
    }

    if (source) {
        source.addEventListener('input', updateSourceCount);
        updateSourceCount();
    }

    document.querySelectorAll('[data-copy-target]').forEach((button) => {
        button.addEventListener('click', async () => {
            const target = document.getElementById(button.dataset.copyTarget);
            if (!target) return;
            try {
                await navigator.clipboard.writeText(target.textContent.trim());
                const original = button.textContent;
                button.textContent = 'Copied';
                setTimeout(() => { button.textContent = original; }, 1400);
            } catch (error) {
                window.getSelection()?.selectAllChildren(target);
            }
        });
    });
})();
