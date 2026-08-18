function initCustomSelects(root = document) {
    root.querySelectorAll('.sleek-form select').forEach(select => {
        if (select.dataset.customSelectInit) return;
        select.dataset.customSelectInit = 'true';

        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select';

        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'custom-select__trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');

        const ariaLabel = select.getAttribute('aria-label');
        if (ariaLabel) trigger.setAttribute('aria-label', ariaLabel);

        const label = document.createElement('span');
        label.className = 'custom-select__label';

        const list = document.createElement('ul');
        list.className = 'custom-select__list';
        list.setAttribute('role', 'listbox');
        list.hidden = true;

        [...select.options].forEach(option => {
            if (option.hidden) return;

            const item = document.createElement('li');
            item.className = 'custom-select__option';
            item.setAttribute('role', 'option');
            item.dataset.value = option.value;
            item.textContent = option.textContent;
            if (option.disabled) item.classList.add('is-disabled');
            list.appendChild(item);
        });

        function syncFromNative() {
            const selected = select.options[select.selectedIndex];
            label.textContent = selected ? selected.textContent : '';
            label.classList.toggle('is-placeholder', !select.value);

            list.querySelectorAll('.custom-select__option').forEach(item => {
                const isSelected = item.dataset.value === select.value;
                const isPlaceholder = item.dataset.value === '';
                item.classList.toggle('is-selected', isSelected && !isPlaceholder);
                item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            });
        }

        function open() {
            wrapper.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            list.hidden = false;
        }

        function close() {
            wrapper.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
            list.hidden = true;
        }

        function setValue(value) {
            select.value = value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            syncFromNative();
            close();
        }

        trigger.addEventListener('click', () => {
            if (wrapper.classList.contains('is-open')) close();
            else open();
        });

        list.addEventListener('click', (event) => {
            const item = event.target.closest('.custom-select__option');
            if (!item || item.classList.contains('is-disabled')) return;
            setValue(item.dataset.value);
        });

        document.addEventListener('click', (event) => {
            if (!wrapper.contains(event.target)) close();
        });

        trigger.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                close();
                return;
            }

            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (wrapper.classList.contains('is-open')) close();
                else open();
            }
        });

        select.addEventListener('change', syncFromNative);
        select.closest('form')?.addEventListener('reset', () => {
            requestAnimationFrame(syncFromNative);
        });

        select.classList.add('custom-select__native');
        select.parentNode.insertBefore(wrapper, select);
        wrapper.append(select, trigger, list);
        trigger.appendChild(label);
        syncFromNative();
    });
}

document.addEventListener('DOMContentLoaded', () => initCustomSelects());
