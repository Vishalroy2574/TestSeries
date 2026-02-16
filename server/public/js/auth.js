let pendingAction = null;

function setPendingAction(action) {
    pendingAction = action;
}

function openAuthModal(mode, action = null) {
    const modal = document.getElementById('authModal');
    modal.classList.remove('hidden');
    switchAuthMode(mode);
    if (action) pendingAction = action;
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.add('hidden');
    // Clear errors when closing
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('registerError').classList.add('hidden');
}

function switchAuthMode(mode) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (mode === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
}

async function handleAuthSubmit(e, type) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const errorEl = document.getElementById(`${type}Error`);

    errorEl.classList.add('hidden');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'Processing...';
    submitBtn.disabled = true;

    try {
        const res = await fetch(`/api/auth/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.message || `${type.charAt(0).toUpperCase() + type.slice(1)} failed`);
        }

        // Auth Successful
        closeAuthModal();

        // Custom function to refresh page state without a full reload
        if (typeof window.refreshPageState === 'function') {
            await window.refreshPageState();
        }

        if (pendingAction) {
            await pendingAction();
            pendingAction = null;
        } else if (typeof window.refreshPageState !== 'function') {
            // Fallback if no specific refresh logic is defined
            location.reload();
        }

    } catch (err) {
        errorEl.innerText = err.message;
        errorEl.classList.remove('hidden');
    } finally {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
}

// Event Listeners
document.getElementById('ajaxLoginForm')?.addEventListener('submit', (e) => handleAuthSubmit(e, 'login'));
document.getElementById('ajaxRegisterForm')?.addEventListener('submit', (e) => handleAuthSubmit(e, 'register'));

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('authModal');
    if (event.target == modal) {
        closeAuthModal();
    }
}
