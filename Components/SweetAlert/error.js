import 'sweetalert2/dist/sweetalert2.all';
import Swal from 'sweetalert2';

export function showAlertError({ icon, title, text, button }) {
  Swal.fire({
    icon,
    title,
    text,
    confirmButtonText: button,
    confirmButtonColor: "#3085d6",
  });
}
