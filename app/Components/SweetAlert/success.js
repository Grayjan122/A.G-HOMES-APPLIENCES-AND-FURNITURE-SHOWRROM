import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.all";

export function AlertSucces(title, icon, draggable, button) {
  Swal.fire({
    title: title,
    icon: icon,
    draggable: draggable,
    confirmButtonText: button
  });
}