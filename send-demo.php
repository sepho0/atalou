<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {

	// Récupération et sécurisation des champs
	$first_name = htmlspecialchars($_POST['first_name']);
	$last_name  = htmlspecialchars($_POST['last_name']);
	$email      = htmlspecialchars($_POST['email']);
	$phone      = htmlspecialchars($_POST['phone']);
	$message    = htmlspecialchars($_POST['message']);

	// Email de l’entreprise
	$toCompany = "cs@atalou.com";

	$subjectCompany = "New Demo Request from $first_name $last_name";
	$bodyCompany = "
You have received a new demo request:

First Name: $first_name
Last Name: $last_name
Email: $email
Phone: $phone

Message:
$message
";

	// Email de confirmation au client
	$subjectClient = "Your Demo Video - Atalou Microsystem";
	$bodyClient = "
Hello $first_name $last_name,

Thank you for requesting a demo of our solutions. 
You can watch the demo video here:

👉 [Lien de la vidéo démo] 

If you have any questions, feel free to contact us.

Best regards,
Atalou Microsystem
";

	// En-têtes
	$headers = "From: no-reply@atalou.com\r\n"; // email valide sur ton domaine
	$headers .= "Reply-To: cs@atalou.com\r\n";
	$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

	// Envoi à l’entreprise
	$companyMailSent = mail($toCompany, $subjectCompany, $bodyCompany, $headers);

	// Envoi au client
	$clientMailSent = mail($email, $subjectClient, $bodyClient, $headers);

	// Vérification de l'envoi
	if ($companyMailSent && $clientMailSent) {
		echo "<h2 style='text-align:center; margin-top:50px;'>
        Thank you, your request has been submitted!<br>You will receive the demo by email shortly.
        </h2>";
	} else {
		echo "<h2 style='text-align:center; margin-top:50px; color:red;'>
        Sorry, there was an error sending your request. Please try again later.
        </h2>";
	}
} else {
	// Si on accède à cette page directement
	header("Location: index.html");
	exit();
}
