export interface Label {
    id: string;
    name: string;
    color: string;
}

export interface Comment {
    id: string;
    author: string;
    body: string;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    assigneeId: string;
    priority: string;
    dueDate: Date | null;
    status: 'TODO' | 'DOING' | 'DONE';
    labels: Label[];
    comments: Comment[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    color: string;
    ownerId: string;
    adminEmails: string[];
    memberEmails: string[];
}

export type NewTask = Omit<Task, 'id' | 'status' | 'labels'>;