<h1>Créer un utilisateur</h1>
<form method="POST" action="/users/create">
    <label for="name">Nom :</label>
    <input type="text" name="name" id="name" required>
    <br>
    <label for="email">Email :</label>
    <input type="email" name="email" id="email" required>
    <br>
    <button type="submit">Créer</button>
</form>
