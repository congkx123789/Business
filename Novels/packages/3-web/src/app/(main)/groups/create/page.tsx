import { CreateGroupForm } from "./CreateGroupForm";

export default function CreateGroupPage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Group</h1>
        <p className="text-muted-foreground">
          Start a new reading community and connect with fellow readers
        </p>
      </header>

      <CreateGroupForm />
    </div>
  );
}

