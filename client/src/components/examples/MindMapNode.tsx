import MindMapNode from '../MindMapNode';

export default function MindMapNodeExample() {
  return (
    <div className="p-8 bg-background flex gap-6">
      <MindMapNode 
        data={{
          title: "Machine Learning",
          type: "Concept",
          description: "Core concepts and algorithms in ML",
          onClick: () => console.log('Concept node clicked')
        }}
      />
      <MindMapNode 
        data={{
          title: "GPT-4 Paper",
          type: "Paper", 
          description: "OpenAI's language model research paper",
          onClick: () => console.log('Paper node clicked')
        }}
      />
      <MindMapNode 
        data={{
          title: "CIFAR-10",
          type: "Dataset",
          description: "Image classification dataset",
          onClick: () => console.log('Dataset node clicked')
        }}
      />
    </div>
  );
}