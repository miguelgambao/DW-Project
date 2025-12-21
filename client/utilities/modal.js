export const Modal = ({ title = "", content = "", onClose }) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const modal = document.createElement("div");
    modal.className = "modal";

    modal.innerHTML = `
        <div class="modal-header">
            <h3>${title}</h3>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-content">
            ${content}
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const close = () => {
        overlay.remove();
        if (onClose) onClose();
    };

    overlay.addEventListener("click", e => {
        if (e.target === overlay) close();
    });

    modal.querySelector(".modal-close").addEventListener("click", close);

    return { close };
};
