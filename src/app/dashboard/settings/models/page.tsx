'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ModelProvider, Model } from '@/types/models';

// 模拟服务器操作
async function fetchProviders() {
  // 这里应该调用实际的API
  const response = await fetch('/api/model-providers');
  if (!response.ok) {
    throw new Error('获取提供商失败');
  }
  return response.json();
}

async function fetchModels(providerId: string) {
  // 这里应该调用实际的API
  const response = await fetch(`/api/model-providers/${providerId}/models`);
  if (!response.ok) {
    throw new Error('获取模型失败');
  }
  return response.json();
}

async function createProvider(data: any) {
  // 这里应该调用实际的API
  const response = await fetch('/api/model-providers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('创建提供商失败');
  }
  return response.json();
}

async function updateProvider(id: string, data: any) {
  // 这里应该调用实际的API
  const response = await fetch(`/api/model-providers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('更新提供商失败');
  }
  return response.json();
}

async function deleteProvider(id: string) {
  // 这里应该调用实际的API
  const response = await fetch(`/api/model-providers/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('删除提供商失败');
  }
  return response.json();
}

async function createModel(data: any) {
  // 这里应该调用实际的API
  const response = await fetch('/api/models', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('创建模型失败');
  }
  return response.json();
}

async function updateModel(id: string, data: any) {
  // 这里应该调用实际的API
  const response = await fetch(`/api/models/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('更新模型失败');
  }
  return response.json();
}

async function deleteModel(id: string) {
  // 这里应该调用实际的API
  const response = await fetch(`/api/models/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('删除模型失败');
  }
  return response.json();
}

export default function ModelsPage() {
  const [providers, setProviders] = useState<ModelProvider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 新提供商表单状态
  const [newProvider, setNewProvider] = useState({
    name: '',
    provider: 'google',
    baseUrl: '',
    apiKey: '',
    isActive: true,
    isDefault: false
  });

  // 新模型表单状态
  const [newModel, setNewModel] = useState({
    name: '',
    modelId: '',
    isActive: true,
    isDefault: false
  });

  // 对话框状态
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteModelDialogOpen, setDeleteModelDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editModelMode, setEditModelMode] = useState(false);
  const [currentProviderId, setCurrentProviderId] = useState<string | null>(
    null
  );
  const [currentModelId, setCurrentModelId] = useState<string | null>(null);

  // 加载提供商
  useEffect(() => {
    async function loadProviders() {
      try {
        setIsLoading(true);
        const data = await fetchProviders();
        setProviders(data.data || []);

        // 如果有提供商，默认选择第一个
        if (data.data && data.data.length > 0) {
          setSelectedProvider(data.data[0].id);
        }
      } catch (error) {
        console.error('加载提供商失败:', error);
        toast.error('加载提供商失败');
      } finally {
        setIsLoading(false);
      }
    }

    loadProviders();
  }, []);

  // 当选择提供商变化时，加载模型
  useEffect(() => {
    async function loadModels() {
      if (!selectedProvider) return;

      try {
        setIsLoading(true);
        const data = await fetchModels(selectedProvider);
        setModels(data.data || []);
      } catch (error) {
        console.error('加载模型失败:', error);
        toast.error('加载模型失败');
      } finally {
        setIsLoading(false);
      }
    }

    loadModels();
  }, [selectedProvider]);

  // 处理提供商表单变化
  const handleProviderChange = (field: string, value: any) => {
    setNewProvider((prev) => ({ ...prev, [field]: value }));
  };

  // 处理模型表单变化
  const handleModelChange = (field: string, value: any) => {
    setNewModel((prev) => ({ ...prev, [field]: value }));
  };

  // 提交提供商表单
  const handleProviderSubmit = async () => {
    try {
      setIsLoading(true);

      if (editMode && currentProviderId) {
        // 更新提供商
        await updateProvider(currentProviderId, newProvider);
        toast.success('提供商更新成功');
      } else {
        // 创建新提供商
        await createProvider(newProvider);
        toast.success('提供商创建成功');
      }

      // 重新加载提供商
      const data = await fetchProviders();
      setProviders(data.data || []);

      // 重置表单和对话框
      setNewProvider({
        name: '',
        provider: 'google',
        baseUrl: '',
        apiKey: '',
        isActive: true,
        isDefault: false
      });
      setProviderDialogOpen(false);
      setEditMode(false);
      setCurrentProviderId(null);
    } catch (error) {
      console.error('提交提供商失败:', error);
      toast.error('提交提供商失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 提交模型表单
  const handleModelSubmit = async () => {
    try {
      if (!selectedProvider) {
        toast.error('请先选择提供商');
        return;
      }

      setIsLoading(true);

      const modelData = {
        ...newModel,
        providerId: selectedProvider
      };

      if (editModelMode && currentModelId) {
        // 更新模型
        await updateModel(currentModelId, modelData);
        toast.success('模型更新成功');
      } else {
        // 创建新模型
        await createModel(modelData);
        toast.success('模型创建成功');
      }

      // 重新加载模型
      const data = await fetchModels(selectedProvider);
      setModels(data.data || []);

      // 重置表单和对话框
      setNewModel({
        name: '',
        modelId: '',
        isActive: true,
        isDefault: false
      });
      setModelDialogOpen(false);
      setEditModelMode(false);
      setCurrentModelId(null);
    } catch (error) {
      console.error('提交模型失败:', error);
      toast.error('提交模型失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 编辑提供商
  const handleEditProvider = (provider: ModelProvider) => {
    setNewProvider({
      name: provider.name,
      provider: provider.provider,
      baseUrl: provider.baseUrl || '',
      apiKey: provider.apiKey || '',
      isActive: provider.isActive || true,
      isDefault: provider.isDefault || false
    });
    setEditMode(true);
    setCurrentProviderId(provider.id);
    setProviderDialogOpen(true);
  };

  // 编辑模型
  const handleEditModel = (model: Model) => {
    setNewModel({
      name: model.name,
      modelId: model.modelId,
      isActive: model.isActive || true,
      isDefault: model.isDefault || false
    });
    setEditModelMode(true);
    setCurrentModelId(model.id);
    setModelDialogOpen(true);
  };

  // 删除提供商
  const handleDeleteProvider = async () => {
    try {
      if (!currentProviderId) return;

      setIsLoading(true);
      await deleteProvider(currentProviderId);

      // 重新加载提供商
      const data = await fetchProviders();
      setProviders(data.data || []);

      // 如果删除的是当前选中的提供商，重置选择
      if (currentProviderId === selectedProvider) {
        setSelectedProvider(
          data.data && data.data.length > 0 ? data.data[0].id : null
        );
        setModels([]);
      }

      toast.success('提供商删除成功');
      setDeleteDialogOpen(false);
      setCurrentProviderId(null);
    } catch (error) {
      console.error('删除提供商失败:', error);
      toast.error('删除提供商失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除模型
  const handleDeleteModel = async () => {
    try {
      if (!currentModelId) return;

      setIsLoading(true);
      await deleteModel(currentModelId);

      // 重新加载模型
      if (selectedProvider) {
        const data = await fetchModels(selectedProvider);
        setModels(data.data || []);
      }

      toast.success('模型删除成功');
      setDeleteModelDialogOpen(false);
      setCurrentModelId(null);
    } catch (error) {
      console.error('删除模型失败:', error);
      toast.error('删除模型失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='container mx-auto py-6'>
      <h1 className='mb-6 text-2xl font-bold'>模型设置</h1>

      <Tabs defaultValue='providers'>
        <TabsList className='mb-4'>
          <TabsTrigger value='providers'>提供商</TabsTrigger>
          <TabsTrigger value='models'>模型</TabsTrigger>
        </TabsList>

        {/* 提供商标签页 */}
        <TabsContent value='providers'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-xl font-semibold'>AI 提供商</h2>
            <Dialog
              open={providerDialogOpen}
              onOpenChange={setProviderDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditMode(false);
                    setNewProvider({
                      name: '',
                      provider: 'google',
                      baseUrl: '',
                      apiKey: '',
                      isActive: true,
                      isDefault: false
                    });
                  }}
                >
                  添加提供商
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editMode ? '编辑提供商' : '添加提供商'}
                  </DialogTitle>
                  <DialogDescription>
                    配置AI模型提供商的详细信息
                  </DialogDescription>
                </DialogHeader>

                <div className='grid gap-4 py-4'>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='name' className='text-right'>
                      名称
                    </Label>
                    <Input
                      id='name'
                      value={newProvider.name}
                      onChange={(e) =>
                        handleProviderChange('name', e.target.value)
                      }
                      className='col-span-3'
                      placeholder='例如: Google AI'
                    />
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='provider' className='text-right'>
                      提供商
                    </Label>
                    <Select
                      value={newProvider.provider}
                      onValueChange={(value) =>
                        handleProviderChange('provider', value)
                      }
                    >
                      <SelectTrigger className='col-span-3'>
                        <SelectValue placeholder='选择提供商' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='google'>Google</SelectItem>
                        <SelectItem value='openai'>OpenAI</SelectItem>
                        <SelectItem value='anthropic'>Anthropic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='baseUrl' className='text-right'>
                      基础URL
                    </Label>
                    <Input
                      id='baseUrl'
                      value={newProvider.baseUrl}
                      onChange={(e) =>
                        handleProviderChange('baseUrl', e.target.value)
                      }
                      className='col-span-3'
                      placeholder='可选，例如: https://api.openai.com/v1'
                    />
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='apiKey' className='text-right'>
                      API密钥
                    </Label>
                    <Input
                      id='apiKey'
                      type='password'
                      value={newProvider.apiKey}
                      onChange={(e) =>
                        handleProviderChange('apiKey', e.target.value)
                      }
                      className='col-span-3'
                      placeholder='输入API密钥'
                    />
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='isActive' className='text-right'>
                      启用
                    </Label>
                    <div className='col-span-3 flex items-center space-x-2'>
                      <Switch
                        id='isActive'
                        checked={newProvider.isActive}
                        onCheckedChange={(checked) =>
                          handleProviderChange('isActive', checked)
                        }
                      />
                      <Label htmlFor='isActive'>启用此提供商</Label>
                    </div>
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='isDefault' className='text-right'>
                      默认
                    </Label>
                    <div className='col-span-3 flex items-center space-x-2'>
                      <Switch
                        id='isDefault'
                        checked={newProvider.isDefault}
                        onCheckedChange={(checked) =>
                          handleProviderChange('isDefault', checked)
                        }
                      />
                      <Label htmlFor='isDefault'>设为默认提供商</Label>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setProviderDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={handleProviderSubmit} disabled={isLoading}>
                    {isLoading ? '处理中...' : editMode ? '更新' : '添加'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {providers.length === 0 ? (
              <div className='col-span-full py-10 text-center text-gray-500'>
                {isLoading ? '加载中...' : '暂无提供商，请添加一个提供商'}
              </div>
            ) : (
              providers.map((provider) => (
                <Card
                  key={provider.id}
                  className={provider.isDefault ? 'border-blue-500' : ''}
                >
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div>
                        <CardTitle>{provider.name}</CardTitle>
                        <CardDescription>{provider.provider}</CardDescription>
                      </div>
                      {provider.isDefault && (
                        <div className='rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800'>
                          默认
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      {provider.baseUrl && (
                        <div className='text-sm'>
                          <span className='font-medium'>基础URL:</span>{' '}
                          {provider.baseUrl}
                        </div>
                      )}
                      <div className='text-sm'>
                        <span className='font-medium'>API密钥:</span>{' '}
                        {provider.apiKey ? '******' : '未设置'}
                      </div>
                      <div className='text-sm'>
                        <span className='font-medium'>状态:</span>{' '}
                        {provider.isActive ? '启用' : '禁用'}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className='flex justify-between'>
                    <Button
                      variant='outline'
                      onClick={() => handleEditProvider(provider)}
                    >
                      编辑
                    </Button>
                    <AlertDialog
                      open={
                        deleteDialogOpen && currentProviderId === provider.id
                      }
                      onOpenChange={(open) => {
                        setDeleteDialogOpen(open);
                        if (!open) setCurrentProviderId(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant='destructive'
                          onClick={() => {
                            setCurrentProviderId(provider.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>
                            您确定要删除此提供商吗？此操作无法撤销，并且会删除与此提供商关联的所有模型。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteProvider}>
                            {isLoading ? '删除中...' : '删除'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* 模型标签页 */}
        <TabsContent value='models'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <h2 className='text-xl font-semibold'>AI 模型</h2>
              <Select
                value={selectedProvider || ''}
                onValueChange={setSelectedProvider}
              >
                <SelectTrigger className='w-[200px]'>
                  <SelectValue placeholder='选择提供商' />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Dialog open={modelDialogOpen} onOpenChange={setModelDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditModelMode(false);
                    setNewModel({
                      name: '',
                      modelId: '',
                      isActive: true,
                      isDefault: false
                    });
                  }}
                  disabled={!selectedProvider}
                >
                  添加模型
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editModelMode ? '编辑模型' : '添加模型'}
                  </DialogTitle>
                  <DialogDescription>配置AI模型的详细信息</DialogDescription>
                </DialogHeader>

                <div className='grid gap-4 py-4'>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='modelName' className='text-right'>
                      名称
                    </Label>
                    <Input
                      id='modelName'
                      value={newModel.name}
                      onChange={(e) =>
                        handleModelChange('name', e.target.value)
                      }
                      className='col-span-3'
                      placeholder='例如: Gemini Pro'
                    />
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='modelId' className='text-right'>
                      模型ID
                    </Label>
                    <Input
                      id='modelId'
                      value={newModel.modelId}
                      onChange={(e) =>
                        handleModelChange('modelId', e.target.value)
                      }
                      className='col-span-3'
                      placeholder='例如: gemini-2.0-flash'
                    />
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='modelIsActive' className='text-right'>
                      启用
                    </Label>
                    <div className='col-span-3 flex items-center space-x-2'>
                      <Switch
                        id='modelIsActive'
                        checked={newModel.isActive}
                        onCheckedChange={(checked) =>
                          handleModelChange('isActive', checked)
                        }
                      />
                      <Label htmlFor='modelIsActive'>启用此模型</Label>
                    </div>
                  </div>

                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='modelIsDefault' className='text-right'>
                      默认
                    </Label>
                    <div className='col-span-3 flex items-center space-x-2'>
                      <Switch
                        id='modelIsDefault'
                        checked={newModel.isDefault}
                        onCheckedChange={(checked) =>
                          handleModelChange('isDefault', checked)
                        }
                      />
                      <Label htmlFor='modelIsDefault'>设为默认模型</Label>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => setModelDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={handleModelSubmit} disabled={isLoading}>
                    {isLoading ? '处理中...' : editModelMode ? '更新' : '添加'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {!selectedProvider ? (
              <div className='col-span-full py-10 text-center text-gray-500'>
                请先选择一个提供商
              </div>
            ) : models.length === 0 ? (
              <div className='col-span-full py-10 text-center text-gray-500'>
                {isLoading ? '加载中...' : '暂无模型，请添加一个模型'}
              </div>
            ) : (
              models.map((model) => (
                <Card
                  key={model.id}
                  className={model.isDefault ? 'border-green-500' : ''}
                >
                  <CardHeader>
                    <div className='flex items-start justify-between'>
                      <div>
                        <CardTitle>{model.name}</CardTitle>
                        <CardDescription>{model.modelId}</CardDescription>
                      </div>
                      {model.isDefault && (
                        <div className='rounded-full bg-green-100 px-2 py-1 text-xs text-green-800'>
                          默认模型
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      <div className='text-sm'>
                        <span className='font-medium'>状态:</span>{' '}
                        {model.isActive ? '启用' : '禁用'}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className='flex justify-between'>
                    <Button
                      variant='outline'
                      onClick={() => handleEditModel(model)}
                    >
                      编辑
                    </Button>
                    <AlertDialog
                      open={
                        deleteModelDialogOpen && currentModelId === model.id
                      }
                      onOpenChange={(open) => {
                        setDeleteModelDialogOpen(open);
                        if (!open) setCurrentModelId(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant='destructive'
                          onClick={() => {
                            setCurrentModelId(model.id);
                            setDeleteModelDialogOpen(true);
                          }}
                        >
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>
                            您确定要删除此模型吗？此操作无法撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteModel}>
                            {isLoading ? '删除中...' : '删除'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
